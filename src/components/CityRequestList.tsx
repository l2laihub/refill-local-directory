import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CityRequest } from '../lib/types';
import { trackEvent } from '../lib/analytics';
import Button from './Button';

const CityRequestList: React.FC = () => {
  const [cityRequests, setCityRequests] = useState<CityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingCity, setVotingCity] = useState<string | null>(null);

  useEffect(() => {
    fetchCityRequests();
  }, []);

  const fetchCityRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('city_requests')
        .select('*')
        .order('votes', { ascending: false })
        .limit(10);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setCityRequests(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching city requests:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (cityRequestId: string) => {
    try {
      setVotingCity(cityRequestId);
      
      const { error } = await supabase.rpc('increment_city_request_votes_by_id', {
        city_request_id: cityRequestId
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update the local state
      setCityRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === cityRequestId 
            ? { ...req, votes: req.votes + 1 } 
            : req
        )
      );

      trackEvent('city_vote', {
        city_request_id: cityRequestId
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error voting for city:', errorMessage);
    } finally {
      setVotingCity(null);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Loading requested cities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Button 
          onClick={fetchCityRequests}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (cityRequests.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No city requests yet. Be the first to request a city!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Most Requested Cities</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State/Province
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votes
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cityRequests.map((city, index) => (
              <tr key={city.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {city.city_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {city.state}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {city.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {city.votes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleVote(city.id)}
                    disabled={votingCity === city.id}
                    className="text-sage-600 hover:text-sage-900"
                  >
                    {votingCity === city.id ? 'Voting...' : 'Vote'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-sm text-gray-500 mt-4 text-center">
        Don't see your city? <a href="/request-city" className="text-sage-600 hover:underline">Request it here</a>.
      </p>
    </div>
  );
};

export default CityRequestList;
