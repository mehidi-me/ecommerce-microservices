import { Router } from 'express';
import {
    getProducts, getProduct, getByCategory,
    createProduct, updateProduct, deleteProduct,
} from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.get('/category/:category', getByCategory);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
