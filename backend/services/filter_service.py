import pandas as pd
from typing import List, Dict, Optional, Any


class ProductFilterService:
    def __init__(self, products_df: pd.DataFrame):
        """Initialize with products dataframe"""
        self.products_df = products_df

    def filter_products(
        self,
        category: Optional[str] = None,
        earth_score_min: Optional[int] = None,
        earth_score_max: Optional[int] = None,
        sort_by: str = "earth_score",
        ascending: bool = False,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Filter products based on criteria
        
        Args:
            category: Product category to filter by
            earth_score_min: Minimum EarthScore
            earth_score_max: Maximum EarthScore  
            sort_by: Column to sort by
            ascending: Sort order
            limit: Maximum number of results
            
        Returns:
            List of filtered products
        """
        # Start with all products
        filtered_df = self.products_df.copy()

        # Apply category filter
        if category:
            filtered_df = filtered_df[
                filtered_df['category'].str.lower() == category.lower()
            ]

        # Apply EarthScore filters
        if earth_score_min is not None:
            filtered_df = filtered_df[
                filtered_df['earth_score'] >= earth_score_min
            ]

        if earth_score_max is not None:
            filtered_df = filtered_df[
                filtered_df['earth_score'] <= earth_score_max
            ]

        # Sort results
        if sort_by in filtered_df.columns:
            filtered_df = filtered_df.sort_values(
                by=sort_by,
                ascending=ascending
            )

        # Limit results
        filtered_df = filtered_df.head(limit)

        # Convert to list of dicts
        return filtered_df.to_dict('records')

    def get_highest_rated(
        self,
        category: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get highest rated products"""
        return self.filter_products(
            category=category,
            sort_by='earth_score',
            ascending=False,
            limit=limit
        )

    def parse_filter_query(self, query: str) -> Dict[str, Any]:
        """
        Parse natural language filter query
        
        Examples:
        - "products with earthscore > 60"
        - "kitchen items above 70"
        - "highest rated electronics"
        """
        query_lower = query.lower()
        filters = {}

        # Extract category
        categories = ['kitchen', 'electronics', 'clothing', 'home', 'beauty']
        for cat in categories:
            if cat in query_lower:
                filters['category'] = cat
                break

        # Extract EarthScore conditions
        import re

        # Pattern for "greater than" variations
        gt_patterns = [
            r'earthscore\s*>\s*(\d+)',
            r'earth score\s*>\s*(\d+)',
            r'score\s*>\s*(\d+)',
            r'above\s+(\d+)',
            r'greater\s+than\s+(\d+)'
        ]

        for pattern in gt_patterns:
            match = re.search(pattern, query_lower)
            if match:
                filters['earth_score_min'] = int(match.group(1))
                break

        # Check for "highest rated"
        if 'highest' in query_lower or 'top' in query_lower:
            filters['sort_by'] = 'earth_score'
            filters['ascending'] = False
            filters['limit'] = 5

        return filters
