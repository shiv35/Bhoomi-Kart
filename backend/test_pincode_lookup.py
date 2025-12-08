#!/usr/bin/env python3
"""
Test script to verify pincode lookup works correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from clustering_service import GroupBuyClusteringService

# Test different pincodes
test_pincodes = ['400701', '400705', '400703', '400708']

print("🧪 Testing Pincode Lookup\n")
print("=" * 50)

service = GroupBuyClusteringService('../data/users_pincodes.csv')

for pincode in test_pincodes:
    print(f"\n📍 Testing pincode: {pincode}")
    location = service._get_location_from_pincode(pincode)
    print(f"   Location: {location}")
    
    # Test nearby users
    nearby = service._get_nearby_users(location, radius_km=5.0)
    print(f"   Nearby users: {len(nearby)}")
    if len(nearby) > 0:
        unique_pincodes = nearby['pincode'].unique()
        print(f"   Unique pincodes in nearby users: {unique_pincodes[:5]}")

print("\n" + "=" * 50)
print("✅ Test complete")

