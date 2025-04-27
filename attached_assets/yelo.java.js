import { useState } from 'react';

const RideRequest = ({ contract }) => {
  const [pickup, setPickup] = useState('');

  const handleRequest = async () => {
    const fare = calculateFare(pickup); // Mock fare logic
    const momoTxId = await mockMomoPayment(fare);
    await contract.requestRide(pickup, momoTxId, fare);
  };

  return (
    <div>
      <h2>YeloLink Ride Request</h2>
      <input 
        placeholder="Enter pickup location"
        onChange={(e) => setPickup(e.target.value)}
      />
      <button onClick={handleRequest}>Book YeloLink Ride</button>
    </div>
  );
};