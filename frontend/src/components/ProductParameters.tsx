import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  GridLegacy as Grid,
  Button
} from '@mui/material';
import {
  Search,
  FilterList,
  Info,
  Download,
  Co2Rounded as Leaf,
  Recycling,
  Nature,
  Build,
  LocalShipping,
  EmojiNature
} from '@mui/icons-material';
import SpaIcon from '@mui/icons-material/Spa';
import axios from 'axios';

interface ProductParameter {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
  recyclability_percent: number;
  biodegradability_score: number;
  durability_rating: number;
  repairability_index: number;
  transport_distance_km: number;
  manufacturing_emissions_gco2e: number;
  is_fair_trade: boolean;
  supply_chain_transparency_score: number;
  earth_score: number;
}

const ProductParameters: React.FC = () => {
  const [products, setProducts] = useState<ProductParameter[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductParameter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/products');
      const productData = response.data.map((p: any) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        category: p.category,
        price: p.price,
        recyclability_percent: p.recyclability_percent || 0,
        biodegradability_score: p.biodegradability_score || 0,
        durability_rating: p.durability_rating || 0,
        repairability_index: p.repairability_index || 0,
        transport_distance_km: p.transport_distance_km || 0,
        manufacturing_emissions_gco2e: p.manufacturing_emissions_gco2e || 0,
        is_fair_trade: p.is_fair_trade || false,
        supply_chain_transparency_score: p.supply_chain_transparency_score || 0,
        earth_score: p.earth_score || 0
      }));
      setProducts(productData);
      setFilteredProducts(productData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, products]);

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProducts(filtered);
    setPage(0);
  };

  const getEarthScoreColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return '#4caf50';
    if (percentage >= 40) return '#ff9800';
    return '#f44336';
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToCSV = () => {
    const headers = ['Product Name', 'Category', 'Recyclability %', 'Biodegradability', 'Durability', 'Repairability', 'Transport Distance (km)', 'EarthScore'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(p => [
        `"${p.product_name}"`,
        p.category,
        p.recyclability_percent,
        p.biodegradability_score,
        p.durability_rating,
        p.repairability_index,
        p.transport_distance_km,
        p.earth_score
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_parameters.csv';
    a.click();
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Product Parameters for Calculator
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Below are the sustainability parameters for products. You can use these values in the EarthScore calculator.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #81c784 0%, #4caf50 100%)' }}>
            <CardContent>
              <Typography color="white" variant="h6">Total Products</Typography>
              <Typography color="white" variant="h3">{products.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4fc3f7 0%, #2196f3 100%)' }}>
            <CardContent>
              <Typography color="white" variant="h6">Avg EarthScore</Typography>
              <Typography color="white" variant="h3">
                {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.earth_score, 0) / products.length) : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)' }}>
            <CardContent>
              <Typography color="white" variant="h6">Fair Trade</Typography>
              <Typography color="white" variant="h3">
                {products.filter(p => p.is_fair_trade).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #e57373 0%, #f44336 100%)' }}>
            <CardContent>
              <Typography color="white" variant="h6">Categories</Typography>
              <Typography color="white" variant="h3">{categories.length - 1}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search Product Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={exportToCSV}
              sx={{ height: '56px' }}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 250 }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                <Tooltip title="Percentage of material that can be recycled">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Recycling sx={{ mr: 0.5, fontSize: 16 }} />
                    Recyclability
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                <Tooltip title="How well the product breaks down naturally (1-5)">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Nature sx={{ mr: 0.5, fontSize: 16 }} />
                    Biodegradability
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                <Tooltip title="Expected product lifespan rating (1-5)">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Build sx={{ mr: 0.5, fontSize: 16 }} />
                    Durability
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                <Tooltip title="How easily the product can be repaired (1-5)">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Build sx={{ mr: 0.5, fontSize: 16 }} />
                    Repairability
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                <Tooltip title="Distance product traveled from manufacturer">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocalShipping sx={{ mr: 0.5, fontSize: 16 }} />
                    Transport (km)
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                <Tooltip title="Overall sustainability score (0-100)">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SpaIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    EarthScore
                  </Box>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow key={product.product_id} hover>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography
                        sx={{
                          color: getScoreColor(product.recyclability_percent, 100),
                          fontWeight: 'bold'
                        }}
                      >
                        {product.recyclability_percent}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        color: getScoreColor(product.biodegradability_score, 5),
                        fontWeight: 'bold'
                      }}
                    >
                      {product.biodegradability_score}/5
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        color: getScoreColor(product.durability_rating, 5),
                        fontWeight: 'bold'
                      }}
                    >
                      {product.durability_rating}/5
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        color: getScoreColor(product.repairability_index, 5),
                        fontWeight: 'bold'
                      }}
                    >
                      {product.repairability_index}/5
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{product.transport_distance_km.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={product.earth_score}
                      color={getEarthScoreColor(product.earth_score)}
                      icon={<SpaIcon />}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Info Section */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Info sx={{ mr: 1 }} />
          Understanding the Parameters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" paragraph>
              <strong>Recyclability:</strong> Percentage of the product that can be recycled
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Biodegradability:</strong> How well the product breaks down naturally (1-5 scale)
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Durability:</strong> Expected lifespan and resistance to wear (1-5 scale)
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" paragraph>
              <strong>Repairability:</strong> How easily the product can be fixed (1-5 scale)
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Transport Distance:</strong> Distance from manufacturer to warehouse in kilometers
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>EarthScore:</strong> Overall sustainability rating (0-100, higher is better)
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductParameters;