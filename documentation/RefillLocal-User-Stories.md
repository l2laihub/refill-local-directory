# RefillLocal - User Stories

This document maps out user stories for the RefillLocal platform, organized by epics and features. It serves as a bridge between the PRD and development tasks, providing a user-centered perspective for implementation.

## Epic: City Search & Store Discovery

### User Story: Searching for Stores by City

**As a** conscious consumer,  
**I want to** search for refill stores in my city,  
**So that** I can find sustainable shopping options near me.

**Acceptance Criteria:**
- User can enter their city name in a search field
- System validates if the city is in the supported list
- Results show stores available in that city
- If city isn't supported, user sees a "Coming Soon" message with waitlist option

**Story Points:** 5

### User Story: Browsing Store Listings

**As a** conscious consumer,  
**I want to** browse through store listings in my area,  
**So that** I can compare options and choose stores that meet my needs.

**Acceptance Criteria:**
- User can view a list of stores after selecting their city
- Each store card shows name, image, and key info (categories, rating)
- User can scroll through results with lazy loading for performance
- Results update without page refresh

**Story Points:** 5

### User Story: Filtering Store Results

**As a** conscious consumer,  
**I want to** filter stores by product categories,  
**So that** I can find stores that offer specific items I need.

**Acceptance Criteria:**
- User can select from predefined product categories (e.g., pantry, cleaning, personal care)
- Filters can be combined and applied instantly
- Results update without page refresh
- Selected filters are visually indicated and easily removable

**Story Points:** 3

### User Story: Requesting a New City

**As a** conscious consumer,  
**I want to** request that my city be added to the platform,  
**So that** I can use the service in my location in the future.

**Acceptance Criteria:**
- User can submit a city request form
- Form captures city name, state/province, and country
- User receives confirmation of submission
- Admin dashboard shows city requests sorted by frequency

**Story Points:** 3

## Epic: Detailed Store Information

### User Story: Viewing Store Details

**As a** conscious consumer,  
**I want to** view detailed information about a specific store,  
**So that** I can decide if it meets my shopping needs.

**Acceptance Criteria:**
- User can click on a store to view its detailed profile page
- Profile shows store name, description, images, hours, address, and contact info
- User can see product categories offered by the store
- Page includes a "What to Bring" section with container requirements

**Story Points:** 8

### User Story: Finding Store Location

**As a** conscious consumer,  
**I want to** see a store's location on a map,  
**So that** I can easily find how to get there.

**Acceptance Criteria:**
- Store profile includes an interactive map
- Map shows store location with a pin
- User can click for directions
- Map is responsive and works on mobile devices

**Story Points:** 5

### User Story: Reading & Writing Reviews

**As a** conscious consumer,  
**I want to** read and write reviews for stores,  
**So that** I can share my experience and learn from others.

**Acceptance Criteria:**
- Store profile displays average rating and number of reviews
- User can read all reviews with sorting options
- Authenticated users can write reviews with star rating and comments
- Store owners can respond to reviews

**Story Points:** 8

## Epic: Community Contributions

### User Story: Adding a New Store

**As a** conscious consumer,  
**I want to** add a store that isn't yet in the directory,  
**So that** others can discover it and support sustainable shopping.

**Acceptance Criteria:**
- User can access "Add a Store" form
- Form includes fields for all necessary store information
- User can upload store images
- Submission goes to moderation queue before publishing
- User receives notification when store is approved

**Story Points:** 13

### User Story: Suggesting Updates to Store Information

**As a** conscious consumer,  
**I want to** suggest updates to store information,  
**So that** the directory stays accurate and up-to-date.

**Acceptance Criteria:**
- User can access "Suggest Edit" option on store profiles
- Form shows current information with editable fields
- User can specify which fields need updating
- Admin can review and approve/reject suggested changes
- Original contributor is notified of changes

**Story Points:** 8

## Epic: User Accounts & Personalization

### User Story: Creating an Account

**As a** conscious consumer,  
**I want to** create a personal account,  
**So that** I can save favorites and contribute to the platform.

**Acceptance Criteria:**
- User can register with email or social authentication
- Registration requires minimal information (name, email, password)
- User receives verification email
- Password requirements follow security best practices

**Story Points:** 5

### User Story: Saving Favorite Stores

**As a** conscious consumer,  
**I want to** save stores to my favorites list,  
**So that** I can easily find them again later.

**Acceptance Criteria:**
- Authenticated users can click a heart/save icon on store cards and profiles
- Favorites are saved to user's profile
- User can view all favorites in a dedicated section
- User can remove items from favorites

**Story Points:** 3

### User Story: Tracking Contributions

**As a** conscious consumer,  
**I want to** see a history of my contributions to the platform,  
**So that** I can track my impact on the community.

**Acceptance Criteria:**
- User profile includes a "Contributions" section
- Section shows stores added, edits suggested, and reviews written
- Contributions include status (pending, approved, rejected)
- User receives recognition badges for contribution milestones

**Story Points:** 5

## Epic: Waitlist & Launch

### User Story: Joining the Waitlist

**As a** conscious consumer,  
**I want to** join the waitlist for the platform,  
**So that** I can be notified when it launches in my area.

**Acceptance Criteria:**
- User can enter email and city on waitlist form
- Form includes optional referral field
- User receives confirmation email
- User data is securely stored

**Story Points:** 3

### User Story: Referring Friends

**As a** conscious consumer,  
**I want to** refer friends to the waitlist,  
**So that** we can spread the word about sustainable shopping.

**Acceptance Criteria:**
- Waitlist confirmation includes shareable referral link
- System tracks referrals by source
- Referrer gets notification when friends join
- Referral dashboard shows impact metrics

**Story Points:** 5

## Epic: Store Owner Experience

### User Story: Claiming a Store Listing

**As a** store owner,  
**I want to** claim my store listing,  
**So that** I can ensure the information is accurate and up-to-date.

**Acceptance Criteria:**
- Store owners can request to claim an existing listing
- Verification process confirms ownership (business email, documents)
- Once verified, owner gets enhanced editing privileges
- Owner can designate additional managers

**Story Points:** 8

### User Story: Managing Store Profile

**As a** store owner,  
**I want to** manage my store's profile information,  
**So that** customers have accurate details about my business.

**Acceptance Criteria:**
- Verified owners can edit all store information
- Changes go live immediately (no moderation for verified owners)
- Owner can update hours, products, photos, and special announcements
- Owner receives notification when users suggest edits

**Story Points:** 5

## Epic: Administration & Moderation

### User Story: Reviewing Store Submissions

**As an** admin,  
**I want to** review and approve store submissions,  
**So that** only accurate and appropriate listings are published.

**Acceptance Criteria:**
- Admin dashboard shows queue of pending submissions
- Admin can approve, reject, or request changes
- System sends appropriate notifications to contributors
- Admin can edit submissions before approval

**Story Points:** 8

### User Story: Managing City Launches

**As an** admin,  
**I want to** manage the launch of new cities,  
**So that** we can expand the platform in a controlled manner.

**Acceptance Criteria:**
- Admin can add new cities to the platform
- Admin can set city status (coming soon, active)
- System automatically notifies waitlist users when their city launches
- Admin can view metrics on city performance after launch

**Story Points:** 5

## Implementation Priority

### MVP (Phase 1)
- City Search & Store Discovery
- Detailed Store Information (basic)
- Waitlist & Launch

### Phase 2
- Community Contributions
- User Accounts & Personalization
- Store Owner Experience (basic)

### Phase 3
- Enhanced Detailed Store Information (reviews, advanced mapping)
- Advanced Community Contributions
- Enhanced Store Owner Experience
- Administration & Moderation refinements
