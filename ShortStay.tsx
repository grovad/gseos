import React, { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    addDoc,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { ShortStayListing, Booking, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus,
    MapPin,
    Star,
    Calendar,
    DollarSign,
    Info,
    X,
    CheckCircle,
    Clock,
    Home
} from 'lucide-react';
import { format } from 'date-fns';

interface Props {
    user: UserProfile;
}

export default function ShortStay({ user }: Props) {
    const [listings, setListings] = useState<ShortStayListing[]>([]);
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [showListingForm, setShowListingForm] = useState(false);
    const [selectedListing, setSelectedListing] = useState<ShortStayListing | null>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'shortStayListings'), where('status', '==', 'active'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ShortStayListing[];
            setListings(data);
            setLoading(false);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'shortStayListings');
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!auth.currentUser) return;
        const q = query(collection(db, 'bookings'), where('guestId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
            setMyBookings(data);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'bookings');
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-extrabold text-text-pri">Short Stay Services</h2>
                    <p className="text-text-sec text-sm">Book a stay or list your unit for short-term rental.</p>
                </div>
                {user.role === 'resident' && (
                    <button
                        onClick={() => setShowListingForm(true)}
                        className="bg-sidebar text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        List My Unit
                    </button>
                )}
            </div>

            {/* Listings Grid */}
            {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="panel-card overflow-hidden group cursor-pointer"
                            onClick={() => {
                                setSelectedListing(listing);
                                setShowBookingForm(true);
                            }}
                        >
                            <div className="relative h-48 bg-slate-100">
                                <img
                                    src={listing.images?.[0] || 'https://picsum.photos/seed/house/800/600'}
                                    alt={listing.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-extrabold text-text-pri shadow-sm">
                                    ${listing.pricePerNight} <span className="text-[10px] text-text-sec font-bold">/ night</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-1 text-amber-400 mb-2">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="text-[11px] font-bold text-text-sec">4.9 (24 reviews)</span>
                                </div>
                                <h4 className="font-bold text-text-pri mb-1">{listing.title}</h4>
                                <div className="flex items-center gap-1 text-text-sec text-xs mb-4">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{listing.propertyId}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {listing.amenities?.slice(0, 3).map(amenity => (
                                        <span key={amenity} className="text-[9px] font-extrabold uppercase tracking-widest bg-bg-main text-text-sec px-2 py-1 rounded">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-border-theme text-center">
                    <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-text-pri mb-1">No Listings Available</h4>
                    <p className="text-text-sec text-sm">Be the first to list a unit for short stay!</p>
                </div>
            )}

            {/* My Bookings */}
            {myBookings.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-xl font-extrabold text-text-pri mb-6">My Bookings</h3>
                    <div className="panel-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-text-sec text-[10px] font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Listing</th>
                                    <th className="px-6 py-4">Dates</th>
                                    <th className="px-6 py-4">Total Price</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {myBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-text-pri">Stay at {listings.find(l => l.id === booking.listingId)?.title || 'Unit'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-text-sec font-medium">
                                            {format(new Date(booking.checkInDate), 'MMM d')} - {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 font-extrabold text-text-pri">
                                            ${booking.totalPrice}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`status-pill ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-slate-50 text-slate-600 border-slate-100'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showListingForm && (
                    <ListingForm onClose={() => setShowListingForm(false)} />
                )}
                {showBookingForm && selectedListing && (
                    <BookingForm
                        listing={selectedListing}
                        onClose={() => {
                            setShowBookingForm(false);
                            setSelectedListing(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ListingForm({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [propertyId, setPropertyId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'shortStayListings'), {
                ownerId: auth.currentUser.uid,
                title,
                description,
                pricePerNight: Number(price),
                propertyId,
                amenities: ['WiFi', 'Kitchen', 'Parking'],
                images: [`https://picsum.photos/seed/${title}/800/600`],
                status: 'active',
                createdAt: serverTimestamp(),
            });
            onClose();
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'shortStayListings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-sidebar/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
                <div className="bg-sidebar p-8 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">List Your Unit</h2>
                        <p className="text-slate-400 text-xs mt-1">Share your space with the community</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-text-sec uppercase tracking-widest mb-2">Listing Title</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-bg-main border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all text-sm font-medium" placeholder="e.g. Cozy 2BR with Pool View" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-text-sec uppercase tracking-widest mb-2">Price per Night ($)</label>
                                <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 bg-bg-main border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all text-sm font-medium" placeholder="50" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-text-sec uppercase tracking-widest mb-2">Unit ID</label>
                                <input required value={propertyId} onChange={e => setPropertyId(e.target.value)} className="w-full px-4 py-3 bg-bg-main border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all text-sm font-medium" placeholder="Block B, 201" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-text-sec uppercase tracking-widest mb-2">Description</label>
                            <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-bg-main border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all text-sm font-medium resize-none" placeholder="Tell guests about your place..." />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-border-theme rounded-xl font-bold text-sm text-text-sec hover:bg-bg-main transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-accent text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-sky-500 shadow-lg shadow-sky-100 disabled:opacity-50 transition-all">
                            {loading ? 'Listing...' : 'Create Listing'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function BookingForm({ listing, onClose }: { listing: ShortStayListing, onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
            await addDoc(collection(db, 'bookings'), {
                listingId: listing.id,
                guestId: auth.currentUser.uid,
                guestName: auth.currentUser.displayName || 'Guest',
                checkInDate: checkIn,
                checkOutDate: checkOut,
                totalPrice: days * listing.pricePerNight,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            onClose();
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'bookings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-sidebar/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
                <div className="relative h-56 bg-slate-100">
                    <img src={listing.images?.[0] || 'https://picsum.photos/seed/house/800/600'} alt={listing.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-text-pri p-2 rounded-xl hover:bg-white transition-colors shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-accent text-white px-4 py-2 rounded-xl text-sm font-extrabold shadow-lg">
                        ${listing.pricePerNight} <span className="text-[10px] opacity-80 font-bold">/ night</span>
                    </div>
                </div>
                <div className="p-8">
                    <h2 className="text-2xl font-extrabold text-text-pri mb-2 tracking-tight">{listing.title}</h2>
                    <p className="text-text-sec text-sm leading-relaxed mb-8">{listing.description}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-text-sec uppercase tracking-widest mb-2">Check-in</label>
                                <input type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full px-4 py-3 bg-bg-main border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-text-sec uppercase tracking-widest mb-2">Check-out</label>
                                <input type="date" required value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full px-4 py-3 bg-bg-main border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all text-sm font-medium" />
                            </div>
                        </div>

                        <div className="bg-bg-main p-6 rounded-2xl flex justify-between items-center border border-border-theme">
                            <div>
                                <p className="text-[10px] text-text-sec font-extrabold uppercase tracking-widest mb-1">Total Stay</p>
                                <p className="text-3xl font-extrabold text-text-pri tracking-tight">
                                    {checkIn && checkOut ? `$${Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) * listing.pricePerNight}` : '--'}
                                </p>
                            </div>
                            <button type="submit" disabled={loading || !checkIn || !checkOut} className="bg-sidebar text-white px-8 py-4 rounded-xl font-extrabold text-sm hover:bg-slate-800 shadow-lg shadow-slate-200 disabled:opacity-50 transition-all">
                                {loading ? 'Booking...' : 'Confirm Stay'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
