import React from 'react'

const ProductSkeleton = () => {
  return (
    <div className='bg-white rounded shadow p-3 animate-pulse'>
      <div className='bg-gray-200 w-full h-28 rounded mb-3' />
      <div className='h-3 bg-gray-200 rounded w-3/4 mb-2' />
      <div className='h-3 bg-gray-200 rounded w-1/2' />
    </div>
  )
}

export default ProductSkeleton
