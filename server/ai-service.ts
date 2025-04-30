import { Driver, Ride } from '@shared/schema';

/**
 * AI Service for YeloLink
 * Handles ride predictions, token rewards, and dynamic discounts
 */
export class AIService {
  // Threshold for token rewards
  private static TOKEN_RIDE_THRESHOLD = 10;
  // Base discount percentage
  private static BASE_DISCOUNT_PERCENTAGE = 5;
  // Cancellation penalty percentage
  private static CANCELLATION_PENALTY_PERCENTAGE = 15;

  /**
   * Predicts the likelihood of rides in specific areas for drivers
   * @param driverId The ID of the driver
   * @param currentLocation Driver's current location {latitude, longitude}
   * @returns Array of hotspot areas with probability scores
   */
  static async predictRides(
    driverId: number,
    currentLocation: { latitude: number; longitude: number }
  ): Promise<Array<{
    area: string;
    coordinates: { latitude: number; longitude: number };
    probability: number;
    estimatedFare: number;
  }>> {
    // In a production environment, this would call a machine learning model
    // For demonstration, we'll use deterministic predictions based on Tamale's geography
    
    // Common hotspots in Tamale
    const hotspots = [
      {
        area: "Tamale Central Market",
        coordinates: { latitude: 9.4055, longitude: -0.8428 },
        baseProb: 0.85,
        baseFare: 25
      },
      {
        area: "University for Development Studies",
        coordinates: { latitude: 9.4027, longitude: -0.8497 },
        baseProb: 0.75,
        baseFare: 35
      },
      {
        area: "Tamale Teaching Hospital",
        coordinates: { latitude: 9.3816, longitude: -0.8294 },
        baseProb: 0.70,
        baseFare: 30
      },
      {
        area: "Tamale Sports Stadium",
        coordinates: { latitude: 9.4119, longitude: -0.8432 },
        baseProb: 0.60,
        baseFare: 20
      },
      {
        area: "Tamale Airport",
        coordinates: { latitude: 9.5538, longitude: -0.8632 },
        baseProb: 0.65,
        baseFare: 50
      }
    ];

    // Time-based adjustment
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
    const isNight = hour >= 20 || hour <= 5;
    
    // Calculate distance from current location to each hotspot
    return hotspots.map(spot => {
      // Calculate distance
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        spot.coordinates.latitude,
        spot.coordinates.longitude
      );
      
      // Adjust probability based on distance (closer = higher probability)
      let probability = spot.baseProb * (1 - Math.min(distance / 10, 0.5));
      
      // Adjust for time of day
      if (isRushHour) {
        probability *= 1.3; // 30% more likely during rush hours
      } else if (isNight) {
        probability *= 0.7; // 30% less likely at night
      }
      
      // Cap probability at 0.95
      probability = Math.min(probability, 0.95);
      
      // Adjust fare based on time of day
      let estimatedFare = spot.baseFare;
      if (isRushHour) {
        estimatedFare *= 1.2; // 20% higher during rush hours
      } else if (isNight) {
        estimatedFare *= 1.4; // 40% higher at night (night fare)
      }
      
      return {
        area: spot.area,
        coordinates: spot.coordinates,
        probability: parseFloat(probability.toFixed(2)),
        estimatedFare: Math.round(estimatedFare)
      };
    }).sort((a, b) => b.probability - a.probability); // Sort by highest probability
  }

  /**
   * Calculates the distance between two coordinates using the Haversine formula
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Calculates tokens earned based on driver performance
   * @param driver The driver object
   * @param completedRides Array of completed rides
   * @returns Number of tokens earned
   */
  static calculateTokens(driver: Driver, completedRides: Ride[]): number {
    // Base calculation: 1 token for every 10 completed rides
    const rideTokens = Math.floor(completedRides.length / this.TOKEN_RIDE_THRESHOLD);
    
    // Rating bonus: additional tokens for high average rating
    let avgRating = 0;
    const totalRides = driver.totalRides || 0;
    const totalRating = driver.totalRating || 0;
    
    if (totalRides > 0) {
      avgRating = totalRating / totalRides;
    }
    
    const ratingBonus = avgRating >= 4.5 ? 3 : 
                        avgRating >= 4.0 ? 2 : 
                        avgRating >= 3.5 ? 1 : 0;
    
    // Consistency bonus: tokens for regular activity
    // Group rides by day to check consistency
    const ridesByDay = new Map<string, number>();
    completedRides.forEach(ride => {
      if (ride.completionTime) {
        const date = new Date(ride.completionTime).toDateString();
        ridesByDay.set(date, (ridesByDay.get(date) || 0) + 1);
      }
    });
    
    // If driver was active for at least 5 different days
    const consistencyBonus = ridesByDay.size >= 5 ? 2 : 0;
    
    return rideTokens + ratingBonus + consistencyBonus;
  }

  /**
   * Calculates the discount amount for a ride
   * @param userId User ID of the rider
   * @param rideCount Number of rides taken by the user
   * @param isPremium Whether the user has a premium subscription
   * @returns Discount percentage
   */
  static calculateDiscount(userId: number, rideCount: number, isPremium: boolean): number {
    // Base discount
    let discount = this.BASE_DISCOUNT_PERCENTAGE;
    
    // Loyalty bonus: additional discount based on ride count
    if (rideCount >= 50) {
      discount += 15; // 15% additional discount for 50+ rides
    } else if (rideCount >= 20) {
      discount += 10; // 10% additional discount for 20+ rides
    } else if (rideCount >= 10) {
      discount += 5; // 5% additional discount for 10+ rides
    }
    
    // Premium subscriber bonus
    if (isPremium) {
      discount += 10; // 10% additional discount for premium subscribers
    }
    
    // Cap maximum discount
    return Math.min(discount, 30); // Maximum 30% discount
  }

  /**
   * Calculates the cancellation penalty for a ride
   * @param rideId Ride ID
   * @param timeSinceRequest Time elapsed since ride request (in minutes)
   * @param isDriverAssigned Whether a driver has been assigned
   * @returns Penalty amount in percentage of the fare
   */
  static calculateCancellationPenalty(
    rideId: number,
    timeSinceRequest: number,
    isDriverAssigned: boolean
  ): number {
    let penalty = this.CANCELLATION_PENALTY_PERCENTAGE;
    
    // Reduce penalty if cancelled quickly
    if (timeSinceRequest <= 1) {
      // No penalty if cancelled within 1 minute
      return 0;
    } else if (timeSinceRequest <= 3) {
      // Reduced penalty if cancelled within 3 minutes
      penalty = 5;
    }
    
    // Higher penalty if driver was already assigned
    if (isDriverAssigned) {
      penalty += 10;
    }
    
    return penalty;
  }
}