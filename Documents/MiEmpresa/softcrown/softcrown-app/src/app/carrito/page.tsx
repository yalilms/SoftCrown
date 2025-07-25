'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  TagIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { withAuth } from '@/contexts/AuthContext';
import { useEcommerce } from '@/contexts/EcommerceContext';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const ShoppingCartPage = () => {
  const router = useRouter();
  const { 
    state, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    applyDiscount, 
    removeDiscount,
    getCartItemCount 
  } = useEcommerce();
  
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const cart = state.cart;
  const itemCount = getCartItemCount();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    setDiscountError('');
    
    try {
      const success = await applyDiscount(discountCode.trim().toUpperCase());
      if (success) {
        setDiscountCode('');
      } else {
        setDiscountError('Código de descuento inválido o expirado');
      }
    } catch (error) {
      setDiscountError('Error al aplicar el descuento');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    setDiscountCode('');
    setDiscountError('');
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
              <ShoppingCartIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Tu carrito está vacío
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Descubre nuestros servicios profesionales y añade algunos a tu carrito
              </p>
              <Button onClick={() => router.push('/tienda')}>
                <ArrowRightIcon className="w-5 h-5 mr-2" />
                Explorar Servicios
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Carrito de Compras
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {itemCount} artículo{itemCount !== 1 ? 's' : ''} en tu carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Artículos ({itemCount})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Vaciar carrito
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-6"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image Placeholder */}
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <div className="text-white text-xs font-medium text-center px-2">
                            {item.product.name.split(' ').map(word => word[0]).join('').slice(0, 3)}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.product.shortDescription}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Categoría: {item.product.category}</span>
                            <span>Entrega: {item.product.deliveryTime}</span>
                          </div>
                          
                          {/* Customizations */}
                          {item.customizations && Object.keys(item.customizations).length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Personalizaciones:
                              </p>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {Object.entries(item.customizations).map(([key, value]) => (
                                  <span key={key} className="mr-4">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex flex-col items-end gap-4">
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              €{item.totalPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              €{item.unitPrice.toFixed(2)} cada uno
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Discount Code */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Código de Descuento
              </h3>
              
              {cart.discountCode ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        {cart.discountCode}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDiscount}
                      className="text-green-600 hover:text-green-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Descuento aplicado: -€{cart.discountAmount.toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de descuento"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyDiscount}
                      disabled={!discountCode.trim() || isApplyingDiscount}
                      loading={isApplyingDiscount}
                    >
                      <TagIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {discountError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {discountError}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Códigos disponibles: WELCOME10, SAVE20
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resumen del Pedido
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>€{cart.subtotal.toFixed(2)}</span>
                </div>
                
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Descuento</span>
                    <span>-€{cart.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>IVA (21%)</span>
                  <span>€{cart.taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>€{cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleCheckout}
                  className="w-full"
                >
                  Proceder al Checkout
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/tienda')}
                  className="w-full"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Compra Segura
                  </p>
                  <p className="text-blue-600 dark:text-blue-300">
                    Tus datos están protegidos con cifrado SSL de 256 bits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Vaciar Carrito
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Estás seguro de que quieres eliminar todos los artículos de tu carrito? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearCart}
                  className="flex-1"
                >
                  Vaciar Carrito
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default withAuth(ShoppingCartPage, ['client', 'admin']);
