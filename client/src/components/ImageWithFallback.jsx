import React, { useState } from 'react'

const ImageWithFallback = ({ src, srcSet, sizes, alt = '', className = '', fallback = '/images/product-1.svg', ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || fallback)

  // If a srcSet is provided, prefer using the <img> with srcSet for responsive images
  return (
    <img
      src={imgSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        if (e?.target?.src !== fallback) setImgSrc(fallback)
      }}
      {...props}
    />
  )
}

export default ImageWithFallback
