import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">S</span>
                            </div>
                            <span className="font-bold text-xl text-white">ShopNow</span>
                        </div>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Your modern shopping destination. Fast delivery, easy returns, and the best prices.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link href="/products?category=clothing" className="hover:text-white transition-colors">Clothing</Link></li>
                            <li><Link href="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3">Account</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
                            <li><Link href="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
                            <li><Link href="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} ShopNow. Built with Next.js 14 & Microservices.</p>
                </div>
            </div>
        </footer>
    );
}
