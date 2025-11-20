import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any
import json
from datetime import datetime, timedelta
import csv


class GroupBuyClusteringService:
    def __init__(self, users_file_path: str = '../data/users_pincodes.csv'):
        """Initialize with users data"""
        try:
            # Read the CSV file
            self.users_df = pd.read_csv(users_file_path)
            
            # Create a new column for preferred_categories as a list
            preferred_categories_list = []
            
            for index, row in self.users_df.iterrows():
                categories = []
                
                # Check for category1 and category2 columns
                if 'category1' in self.users_df.columns and pd.notna(row['category1']):
                    categories.append(row['category1'])
                if 'category2' in self.users_df.columns and pd.notna(row['category2']):
                    categories.append(row['category2'])
                
                # If old format (categories in columns after longitude), handle that too
                if not categories:
                    # Try to get categories from columns after the standard ones
                    for col in self.users_df.columns[5:]:
                        if pd.notna(row[col]) and col != 'preferred_categories':
                            categories.append(row[col])
                
                preferred_categories_list.append(categories)
            
            # Add the new column to the DataFrame
            self.users_df['preferred_categories'] = preferred_categories_list
            
            print(f"Loaded {len(self.users_df)} users from {users_file_path}")
            
        except Exception as e:
            print(f"Error loading users file: {e}")
            # Create a default DataFrame if file not found
            self.users_df = pd.DataFrame({
                'user_id': [1, 2, 3],
                'name': ['Test User 1', 'Test User 2', 'Test User 3'],
                'pincode': ['400705', '400701', '400703'],
                'latitude': [19.1400, 19.1296, 19.1350],
                'longitude': [72.8450, 72.8367, 72.8400],
                'preferred_categories': [['kitchen', 'home'], ['electronics', 'beauty'], ['clothing', 'kitchen']]
            })
    def find_optimal_groups(self, user_pincode: str, cart_items: List[Dict],
                            radius_km: float = 5.0, min_group_size: int = 3) -> List[Dict[str, Any]]:
        """
        Find optimal group buying options based on location and product matching
        
        Args:
            user_pincode: Current user's pincode
            cart_items: List of items in user's cart
            radius_km: Maximum distance for grouping (in kilometers)
            min_group_size: Minimum number of participants for a group
        
        Returns:
            List of group buying options with participants and savings
        """

        # Get user's location
        user_location = self._get_location_from_pincode(user_pincode)
        if not user_location:
            return []

        # Filter users within radius
        nearby_users = self._get_nearby_users(user_location, radius_km)

        if len(nearby_users) < min_group_size - 1:  # -1 because current user will join
            return []

        # Extract cart categories
        cart_categories = self._extract_categories_from_cart(cart_items)

        # Perform clustering based on location and preferences
        clusters = self._cluster_users(nearby_users, cart_categories)

        # Generate group buying options
        group_options = self._generate_group_options(
            clusters, cart_items, user_pincode, nearby_users
        )

        return group_options

    def _get_location_from_pincode(self, pincode: str) -> Dict[str, float]:
        """Get latitude and longitude for a pincode"""
        location_data = self.users_df[self.users_df['pincode'] == int(pincode)]
        if not location_data.empty:
            return {
                'lat': location_data.iloc[0]['latitude'],
                'lon': location_data.iloc[0]['longitude']
            }
        # Default Mumbai coordinates if pincode not found
        return {'lat': 19.1400, 'lon': 72.8450}

    def _get_nearby_users(self, user_location: Dict[str, float], radius_km: float) -> pd.DataFrame:
        """Find users within specified radius using Haversine formula"""
        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371  # Earth's radius in kilometers
            # coerce all four values to float, then convert to radians
            lat1, lon1, lat2, lon2 = np.radians([
                    float(lat1),
                    float(lon1),
                    float(lat2),
                    float(lon2),
                    ])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
            c = 2 * np.arcsin(np.sqrt(a))
            return R * c

        distances = self.users_df.apply(
            lambda row: haversine_distance(
                user_location['lat'], user_location['lon'],
                row['latitude'], row['longitude']
            ), axis=1
        )

        return self.users_df[distances <= radius_km].copy()

    def _extract_categories_from_cart(self, cart_items: List[Dict]) -> List[str]:
        """Extract categories from cart items"""
        categories = []
        
        # Map common categories to our known categories
        category_mapping = {
            'office': 'home',
            'groceries': 'kitchen',
            'food': 'kitchen',
            'tech': 'electronics',
            'gadgets': 'electronics',
            'apparel': 'clothing',
            'fashion': 'clothing',
            'cosmetics': 'beauty',
            'health': 'personal-care'
        }
        
        for item in cart_items:
            if 'category' in item:
                original_category = item['category'].lower()
                # Use mapping or original if it's already valid
                mapped_category = category_mapping.get(original_category, original_category)
                if mapped_category in ['kitchen', 'electronics', 'clothing', 'home', 'personal-care', 'beauty']:
                    categories.append(mapped_category)
                    
        return list(set(categories))

    def _cluster_users(self, users_df: pd.DataFrame, cart_categories: List[str]) -> Dict[int, List[int]]:
        """Cluster users based on location and preference similarity"""
        # Prepare features for clustering
        features = []

        for idx, user in users_df.iterrows():
            # Location features
            location_features = [user['latitude'], user['longitude']]

            # Category preference features (binary encoding)
            category_match_score = len(
                set(cart_categories) & set(user['preferred_categories']))

            features.append(location_features + [category_match_score])

        # Normalize features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)

        # Perform DBSCAN clustering
        clustering = DBSCAN(eps=0.5, min_samples=2).fit(features_scaled)

        # Group users by cluster
        clusters = {}
        for idx, label in enumerate(clustering.labels_):
            if label != -1:  # Ignore noise points
                if label not in clusters:
                    clusters[label] = []
                clusters[label].append(users_df.index[idx])

        return clusters

    def _generate_group_options(self, clusters: Dict[int, List[int]],
                                cart_items: List[Dict], user_pincode: str,
                                nearby_users: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate group buying options from clusters"""
        options = []

        for cluster_id, user_indices in clusters.items():
            cluster_users = nearby_users.loc[user_indices]

            # Skip if too small
            if len(cluster_users) < 2:
                continue

            # Calculate group details
            avg_distance = self._calculate_avg_distance(cluster_users)
            common_categories = self._find_common_categories(cluster_users)
            matching_items = self._find_matching_items(
                cart_items, common_categories)

            if not matching_items:
                continue

            # Generate group option
            option = {
                'id': f'gb_{cluster_id}_{datetime.now().strftime("%Y%m%d%H%M")}',
                'name': f'{self._get_area_name(cluster_users)} Eco Group',
                'matchingProducts': [item['name'] for item in matching_items],
                'participants': [
                    {
                        'name': row['name'],
                        'pincode': str(row['pincode']),
                        'avatar': self._get_avatar_emoji(row['name'])
                    }
                    for _, row in cluster_users.iterrows()
                ],
                'savings': self._calculate_savings(len(cluster_users) + 1, matching_items),
                'minParticipants': 3,
                'currentParticipants': len(cluster_users),
                'deadline': (datetime.now() + timedelta(days=2)).isoformat(),
                'estimatedDelivery': (datetime.now() + timedelta(days=5)).isoformat(),
                'status': 'available' if len(cluster_users) < 4 else 'almost-full',
                'avgDistance': round(avg_distance, 1),
                'commonCategories': common_categories
            }

            options.append(option)

        # Sort by savings potential
        options.sort(key=lambda x: x['savings']['cost'], reverse=True)

        return options[:3]  # Return top 3 options

    def _calculate_avg_distance(self, cluster_users: pd.DataFrame) -> float:
        """Calculate average distance between users in cluster"""
        if len(cluster_users) < 2:
            return 0

        distances = []
        coords = cluster_users[['latitude', 'longitude']].values

        for i in range(len(coords)):
            for j in range(i + 1, len(coords)):
                dist = np.sqrt((coords[i][0] - coords[j][0])**2 +
                               # Convert to km
                               (coords[i][1] - coords[j][1])**2) * 111
                distances.append(dist)

        return np.mean(distances) if distances else 0

    def _find_common_categories(self, cluster_users: pd.DataFrame) -> List[str]:
        """Find categories preferred by most users in cluster"""
        all_categories = []
        for categories in cluster_users['preferred_categories']:
            all_categories.extend(categories)

        # Count occurrences
        from collections import Counter
        category_counts = Counter(all_categories)

        # Return categories preferred by at least half the users
        threshold = len(cluster_users) / 2
        return [cat for cat, count in category_counts.items() if count >= threshold]

    def _find_matching_items(self, cart_items: List[Dict],
                             common_categories: List[str]) -> List[Dict]:
        """Find cart items that match common categories"""
        matching = []
        for item in cart_items:
            if item.get('category', '').lower() in common_categories:
                matching.append(item)
        return matching

    def _calculate_savings(self, group_size: int, matching_items: List[Dict]) -> Dict[str, float]:
        """Calculate potential savings for group buying"""
        base_discount = 0.05  # 5% base discount
        # Up to 25% for large groups
        size_multiplier = min(group_size * 0.03, 0.25)

        total_value = sum(item.get('price', 0) * item.get('quantity', 1)
                          for item in matching_items)

        cost_savings = total_value * (base_discount + size_multiplier)
        co2_savings = group_size * 1.2  # kg CO2 saved per person

        return {
            'cost': round(cost_savings, 2),
            'co2': round(co2_savings, 1),
            'percentage': round((base_discount + size_multiplier) * 100)
        }

    def _get_area_name(self, cluster_users: pd.DataFrame) -> str:
        """Generate area name from pincodes"""
        pincodes = cluster_users['pincode'].unique()
        if len(pincodes) == 1:
            return f"Pincode {pincodes[0]}"
        else:
            return f"Pincodes {min(pincodes)}-{max(pincodes)}"

    def _get_avatar_emoji(self, name: str) -> str:
        """Get an emoji avatar based on name"""
        emojis = ['👨', '👩', '🧑', '👱', '👴', '👵', '🧔', '👨‍🦱', '👩‍🦰', '👨‍🦳']
        return emojis[hash(name) % len(emojis)]
