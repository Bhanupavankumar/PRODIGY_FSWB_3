import React from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'

const ProductModal = ({ product, onClose, onAdd }) => {
  if (!product) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40' onClick={onClose}>
      <div className='bg-white rounded-lg p-4 w-11/12 max-w-2xl' onClick={(e)=>e.stopPropagation()}>
        <div className='flex gap-4'>
          <div className='w-1/2 flex items-center justify-center'>
            <img src={product.img + '?q=80&w=800&auto=format&fit=crop'} alt={product.name} className='max-h-72 object-contain' />
          </div>
          <div className='w-1/2'>
            <h3 className='text-lg font-semibold'>{product.name}</h3>
            <div className='mt-2 text-gray-600'>{DisplayPriceInRupees(product.price)}</div>
            <p className='mt-3 text-sm text-gray-700'>High-quality fresh product. Add to cart to try it out.</p>
            <div className='mt-4 flex gap-2'>
              <button onClick={()=>{ onAdd(product); onClose() }} className='bg-blue-600 text-white px-4 py-2 rounded'>Add to cart</button>
              <button onClick={onClose} className='px-4 py-2 rounded border'>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
