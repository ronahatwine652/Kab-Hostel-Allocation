import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

const StudentBooking = () => {
    const [hostels, setHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [studentName, setStudentName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState('');

    // Fetch hostels on component mount
    useEffect(() => {
        const fetchHostels = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'hostels'));
                const hostelsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setHostels(hostelsData);
            } catch (err) {
                console.error('Error fetching hostels:', err);
            }
        };
        fetchHostels();
    }, []);

    // Convert file to Base64 string for direct Firestore storage
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedHostel) {
            alert('Please select a hostel first.');
            return;
        }

        // Prevent booking if rooms are zero or negative
        if (selectedHostel.availableRooms <= 0) {
            alert('Sorry, this hostel is fully booked!');
            return;
        }

        setLoading(true);
        setSubmissionError('');

        try {
            let receiptDataString = '';
            if (receiptFile) {
                receiptDataString = await convertFileToBase64(receiptFile);
            }

            // 1. Save booking to Firestore
            await addDoc(collection(db, 'bookings'), {
                studentName,
                email,
                contactNumber,
                hostelId: selectedHostel.id,
                hostelName: selectedHostel.hostelName,
                receiptUrl: receiptDataString,
                status: 'Pending',
                timestamp: new Date()
            });

            // 2. Decrement available room count safely
            const hostelRef = doc(db, 'hostels', selectedHostel.id);
            await updateDoc(hostelRef, {
                availableRooms: increment(-1)
            });

            alert('Booking submitted successfully!');

            // Reset fields
            setStudentName('');
            setEmail('');
            setContactNumber('');
            setReceiptFile(null);
            setSelectedHostel(null);

            // Refresh UI list from Firestore
            const querySnapshot = await getDocs(collection(db, 'hostels'));
            setHostels(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        } catch (error) {
            console.error('Submission Error:', error);
            setSubmissionError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Available Hostels & Free Rooms</h2>
            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr>
                        <th>Hostel Name</th>
                        <th>Room Type</th>
                        <th>Free Rooms</th>
                        <th>Price / Sem (UGX)</th>
                        <th>Utility Notes</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {hostels.map((hostel) => (
                        <tr key={hostel.id}>
                            <td><strong>{hostel.hostelName}</strong></td>
                            <td>{hostel.roomType}</td>
                            <td>{hostel.availableRooms < 0 ? 0 : hostel.availableRooms}</td>
                            <td>{Number(hostel.price).toLocaleString()} UGX</td>
                            <td>{hostel.utilityNotes}</td>
                            <td>
                                <button
                                    onClick={() => setSelectedHostel(hostel)}
                                    disabled={hostel.availableRooms <= 0}
                                >
                                    {selectedHostel?.id === hostel.id ? 'Selected' : 'Select'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedHostel && (
                <div style={{ marginTop: '30px' }}>
                    <h3>Book Room at {selectedHostel.hostelName}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Full Name: </label>
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Email Address: </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Contact Number: </label>
                            <input
                                type="text"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Proof of Payment Receipt (Image / PDF): </label>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setReceiptFile(e.target.files[0])}
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                    {submissionError && (
                        <p style={{ color: 'red' }}>Submission failed: {submissionError}</p>
                    )}
                </div>
            )}
        </div>
    );
};


// CRITICAL: Ensure this export default is at the very bottom
export default StudentBooking;