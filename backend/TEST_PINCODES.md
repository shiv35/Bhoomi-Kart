# Test Pincodes for Group Buy Clustering

## ✅ Working Pincodes (Available in Database)

These pincodes are present in `users_pincodes.csv` and will return group buying suggestions:

### Mumbai Pincodes:
- **400701** - Bandra West
- **400702** - Bandra East  
- **400703** - Andheri West
- **400704** - Andheri East
- **400705** - Goregaon
- **400706** - Malad
- **400707** - Kandivali
- **400708** - Borivali

## ❌ Non-Working Pincodes (Will Show "No Groups Found")

Any pincode NOT in the list above will return an empty result with the message:
**"No group buying options found in your area. You can create a new group or proceed with individual shipping."**

Examples of pincodes that will NOT work:
- 110001 (Delhi)
- 560001 (Bangalore)
- 700001 (Kolkata)
- 400001 (Mumbai Central - not in database)
- 400709 (Any other Mumbai pincode not listed above)

## 🧪 Testing Instructions

1. **Test with working pincode:**
   - Enter: `400705`
   - Expected: Should show group buying options with participants

2. **Test with non-working pincode:**
   - Enter: `110001` or `999999`
   - Expected: Should show "No group buying options found" message

3. **Test with different working pincodes:**
   - Try: `400701`, `400703`, `400708`
   - Expected: Each should show different group suggestions based on location

## 📊 How to Add More Pincodes

To add more pincodes to the database, update `data/users_pincodes.csv` with:
- `user_id`: Unique user ID
- `name`: User name
- `pincode`: 6-digit pincode
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate
- `category1`: First preferred category
- `category2`: Second preferred category

