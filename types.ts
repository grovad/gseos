export type UserRole = 'resident' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    propertyId?: string;
    phoneNumber?: string;
    createdAt: any; // Firestore Timestamp
}

export type RequestStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type RequestPriority = 'low' | 'medium' | 'high' | 'emergency';
export type RequestCategory = 'plumbing' | 'electrical' | 'security' | 'cleaning' | 'other';

export interface MaintenanceRequest {
    id: string;
    residentId: string;
    residentName: string;
    propertyId: string;
    category: RequestCategory;
    description: string;
    status: RequestStatus;
    priority: RequestPriority;
    createdAt: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
    adminNotes?: string;
}

export type AnnouncementType = 'general' | 'emergency' | 'event';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: any; // Firestore Timestamp
    type: AnnouncementType;
}

export type ListingStatus = 'active' | 'inactive';

export interface ShortStayListing {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    pricePerNight: number;
    propertyId: string;
    amenities: string[];
    images: string[];
    status: ListingStatus;
    createdAt: any; // Firestore Timestamp
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
    id: string;
    listingId: string;
    guestId: string;
    guestName: string;
    checkInDate: string; // ISO string
    checkOutDate: string; // ISO string
    totalPrice: number;
    status: BookingStatus;
    createdAt: any; // Firestore Timestamp
}
