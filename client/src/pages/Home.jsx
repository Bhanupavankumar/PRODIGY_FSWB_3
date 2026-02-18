import React from 'react'
import banner from '../assets/banner.jpg'
import bannerMobile from '../assets/banner-mobile.jpg'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { handleAddItemCart } from '../store/cartProduct'
import { valideURLConvert } from '../utils/valideURLConvert'
import { useNavigate } from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import ProductSkeleton from '../components/ProductSkeleton'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import ProductModal from '../components/ProductModal'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()

  // Demo products with responsive Unsplash images and optional badge
  const demoProducts = [
    { id: 'g1', name: 'Fresh Apples', img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1000&auto=format&fit=crop', price: 2.99, rating: 4.5, badge: 'Fresh' },
    { id: 'g2', name: 'Whole Grain Bread', img: 'https://images.unsplash.com/photo-1604908176963-43d9d9d8f75b?q=80&w=1000&auto=format&fit=crop', price: 1.79, rating: 4.2, badge: 'Bestseller' },
    { id: 'g3', name: 'Organic Milk', img: 'https://images.unsplash.com/photo-1585238342028-6b4f8f6b6b46?q=80&w=1000&auto=format&fit=crop', price: 3.49, rating: 4.7 },
    { id: 'g4', name: 'Carrots Pack', img: 'https://images.unsplash.com/photo-1582515073490-399813c6c6f1?q=80&w=1000&auto=format&fit=crop', price: 1.29, rating: 4.1 },
    { id: 'g5', name: 'Oranges', img: 'https://images.unsplash.com/photo-1502741126161-b048400d8a55?q=80&w=1000&auto=format&fit=crop', price: 2.49, rating: 4.4 },
    { id: 'g6', name: 'Avocado', img: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1000&auto=format&fit=crop', price: 1.99, rating: 4.6 },
    { id: 'g7', name: 'Banana Bunch', img: 'https://images.unsplash.com/photo-1574226516831-e1dff420e12f?q=80&w=1000&auto=format&fit=crop', price: 1.09, rating: 4.3 },
    { id: 'g8', name: 'Eggs (6 pcs)', img: 'https://images.unsplash.com/photo-1587502536263-3e5b25a2ef5e?q=80&w=1000&auto=format&fit=crop', price: 2.79, rating: 4.8 },
    { id: 'g9', name: 'Tomato', img: 'https://images.unsplash.com/photo-1542444459-db2f7d6a5a9b?q=80&w=1000&auto=format&fit=crop', price: 1.39, rating: 4.0 },
    { id: 'g10', name: 'Grapes', img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1000&auto=format&fit=crop', price: 3.99, rating: 4.2 },
    { id: 'g11', name: 'Potato', img: 'https://images.unsplash.com/photo-1592928300967-7b6f4c9e8a1c?q=80&w=1000&auto=format&fit=crop', price: 0.99, rating: 4.0 },
    { id: 'g12', name: 'Onion', img: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1000&auto=format&fit=crop', price: 1.19, rating: 4.1 }
  ]

  const renderStars = (rating) => {
    const full = Math.floor(rating)
    const half = rating - full >= 0.5
    const stars = []
    for (let i = 0; i < full; i++) stars.push('full')
    if (half) stars.push('half')
    while (stars.length < 5) stars.push('empty')
    return (
      <div className='flex items-center'>
        {stars.map((s, idx) => (
          <svg key={idx} className='w-4 h-4' viewBox='0 0 24 24' fill={s === 'empty' ? 'none' : '#F59E0B'} stroke='#F59E0B'>
            {s === 'half' ? (
              <g>
                <path d='M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.172L12 18.896V.587z' fill='#F59E0B'/>
                <path d='M12 .587v18.309l-3.336 1.876 1.402-8.172L4.132 9.211l8.2-1.193L12 .587z' fill='none' stroke='#F59E0B'/>
              </g>
            ) : (
              <path d='M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.172L12 18.896 5.664 23.17l1.402-8.172L1.132 9.211l8.2-1.193L12 .587z' />
            )}
          </svg>
        ))}
      </div>
    )
  }

  const dispatch = useDispatch()
  const currentCart = useSelector(state => state.cartItem.cart)
  const [showMiniCart, setShowMiniCart] = React.useState(false)
  const lastActionRef = React.useRef(null)
  const [imgLoaded, setImgLoaded] = React.useState({})
  const [sortBy, setSortBy] = React.useState('featured')
  const [maxPrice, setMaxPrice] = React.useState(null)
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [searchText, setSearchText] = React.useState('')
  const [page, setPage] = React.useState(1)
  const pageSize = 8

  const handleOpenModal = (product) => setSelectedProduct(product)
  const handleCloseModal = () => setSelectedProduct(null)

  const [fetchedProducts, setFetchedProducts] = React.useState([])
  const [loadingProducts, setLoadingProducts] = React.useState(false)
  const [serverTotalPages, setServerTotalPages] = React.useState(null)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const sentinelRef = React.useRef(null)

  // fetch products from server with pagination/filters when possible
  React.useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      setLoadingProducts(true)
      try {
        const resp = await Axios({
          ...SummaryApi.getProduct,
          params: { page, limit: pageSize, q: searchText || undefined, sort: sortBy !== 'featured' ? sortBy : undefined, maxPrice: maxPrice || undefined }
        })
        const responseData = resp?.data
        if (!cancelled && responseData?.success) {
          const data = responseData.data || responseData.products || []
          setFetchedProducts(Array.isArray(data) ? data : (data.items || []))
          // attempt to read total/pages
          const total = responseData.total || responseData.count || responseData.data?.total || 0
          const pages = responseData.pages || (total ? Math.max(1, Math.ceil(total / pageSize)) : null)
          setServerTotalPages(pages)
        }
      } catch (err) {
        // keep demoProducts as fallback
        console.warn('Server products fetch failed, using demo products', err)
        setFetchedProducts([])
        setServerTotalPages(null)
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [page, pageSize, searchText, sortBy, maxPrice])

  // infinite scroll observer: load next page when sentinel is visible
  React.useEffect(() => {
    if (!sentinelRef.current) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isLoadingMore) {
          // if server provides pagination, stop at serverTotalPages
          if (serverTotalPages && page >= serverTotalPages) return
          setIsLoadingMore(true)
          setPage(p => p + 1)
          // allow a small delay to avoid rapid triggers
          setTimeout(() => setIsLoadingMore(false), 600)
        }
      })
    }, { root: null, rootMargin: '200px', threshold: 0.1 })

    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [sentinelRef.current, isLoadingMore, serverTotalPages, page])

  // derived product lists for filtering/sorting/pagination
  const filteredProducts = React.useMemo(() => {
    return demoProducts
      .filter(p => (maxPrice ? p.price <= maxPrice : true))
      .filter(p => (searchText ? p.name.toLowerCase().includes(searchText.toLowerCase()) : true))
      .slice() // copy before sort
      .sort((a,b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        return 0
      })
  }, [demoProducts, maxPrice, searchText, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginated = filteredProducts.slice((page-1)*pageSize, page*pageSize)

  const saveCart = (cart) => {
    try { localStorage.setItem('local_cart', JSON.stringify(cart)) } catch (e) { /* ignore */ }
    dispatch(handleAddItemCart(cart))
  }

  const handleLocalAdd = (product) => {
    // if item exists, increase qty
    const exists = currentCart.find(item => item.productId?._id === product.id)
    let newCart = []
    if (exists) {
      newCart = currentCart.map(item => {
        if (item.productId?._id === product.id) return { ...item, quantity: item.quantity + 1 }
        return item
      })
    } else {
      const cartItem = {
        _id: `local-${product.id}`,
        productId: { _id: product.id, name: product.name, price: product.price, image: product.img, discount: 0 },
        quantity: 1
      }
      newCart = [...currentCart, cartItem]
    }
    saveCart(newCart)
    setShowMiniCart(true)
    lastActionRef.current = { type: 'add', productId: product.id, wasExisting: !!exists }

    // show toast with undo
    toast((t) => (
      <div className='flex items-center gap-3'>
        <div>Added <strong>{product.name}</strong></div>
        <button onClick={() => {
          // undo
          const action = lastActionRef.current
          if (!action) return
          if (action.wasExisting) {
            handleLocalDecrease(product)
          } else {
            const newCart = currentCart.filter(i => i.productId._id !== product.id)
            saveCart(newCart)
          }
          lastActionRef.current = null
          toast.dismiss(t.id)
        }} className='px-2 py-1 bg-gray-200 rounded text-sm'>Undo</button>
      </div>
    ), { duration: 4000 })

    // lightweight analytics event
    try { console.log('analytics:event', { action: 'add_to_cart', productId: product.id, price: product.price }) } catch (e) { }
  }

  const handleLocalDecrease = (product) => {
    const exists = currentCart.find(item => item.productId?._id === product.id)
    if (!exists) return
    let newCart = currentCart.map(item => {
      if (item.productId?._id === product.id) return { ...item, quantity: item.quantity - 1 }
      return item
    }).filter(i => i.quantity > 0)
    saveCart(newCart)
  }

  const handleRedirectProductListpage = (id,cat)=>{
      const subcategory = subCategoryData.find(sub =>
        sub.category?.some(c => c._id === id)
      )
      const subName = subcategory?.name ? `${valideURLConvert(subcategory.name)}-${subcategory._id}` : ''
      const url = subName ? `/${valideURLConvert(cat)}-${id}/${subName}` : `/${valideURLConvert(cat)}-${id}`

      navigate(url)
  }


  return (
   <section className='bg-white'>
      <div className='container mx-auto'>
          <div className={`w-full h-full min-h-48 bg-blue-100 rounded ${!banner && "animate-pulse my-2" } `}>
              <div className='hidden lg:block w-full h-full'>
                <img
                  src={banner || '/images/product-1.svg'}
                  alt='Shop Banner'
                  className='w-full h-full object-cover'
                  loading='lazy'
                  onError={(e)=>{ e.target.src = '/images/product-1.svg' }}
                />
              </div>

              <div className='lg:hidden w-full h-full'>
                <img
                  src={bannerMobile || '/images/product-2.svg'}
                  alt='Shop Banner Mobile'
                  className='w-full h-full object-cover'
                  loading='lazy'
                  onError={(e)=>{ e.target.src = '/images/product-2.svg' }}
                />
              </div>
          </div>

              {/* Mini cart drawer (simple) */}
              {showMiniCart && (
                <div className='fixed right-4 bottom-4 z-50 w-80 bg-white rounded shadow-lg p-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='font-semibold'>Cart</div>
                    <div className='text-sm text-gray-500'>{currentCart.length} items</div>
                  </div>
                  <div className='max-h-40 overflow-auto'>
                    {currentCart.slice(0,5).map(item => (
                      <div key={item._id} className='flex items-center gap-2 mb-2'>
                        <img src={item.productId.image || '/images/product-1.svg'} alt={item.productId.name} className='w-10 h-10 object-contain rounded'/>
                        <div className='flex-1'>
                          <div className='text-sm'>{item.productId.name}</div>
                          <div className='text-xs text-gray-500'>Qty: {item.quantity}</div>
                        </div>
                        <div className='text-sm font-medium'>${(item.productId.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className='mt-2 flex items-center gap-2 justify-end'>
                    <button onClick={() => setShowMiniCart(false)} className='px-2 py-1 bg-gray-200 rounded'>Close</button>
                    <button onClick={() => { setShowMiniCart(false); window.location.href = '/cart' }} className='px-3 py-1 bg-green-600 text-white rounded'>View Cart</button>
                  </div>
                </div>
              )}
      </div>
      
      {/* Grocery picks - product cards */}
      <div className='container mx-auto px-4 my-4'>
        <div className='flex items-center justify-between mb-3 gap-4'>
          <h2 className='text-xl font-semibold'>Grocery Picks</h2>
          <div className='flex items-center gap-2'>
            <input
              type='search'
              placeholder='Search products'
              value={searchText}
              onChange={(e)=> { setSearchText(e.target.value); setPage(1) }}
              className='border rounded px-2 py-1 w-48'
              aria-label='Search products'
            />
            <label className='text-sm text-gray-600'>Max price</label>
            <input type='number' min='0' onChange={(e)=> { setMaxPrice(e.target.value ? Number(e.target.value) : null); setPage(1) }} className='border rounded px-2 py-1 w-24'/>
            <label className='text-sm text-gray-600'>Sort</label>
            <select value={sortBy} onChange={(e)=> { setSortBy(e.target.value); setPage(1) }} className='border rounded px-2 py-1'>
              <option value='featured'>Featured</option>
              <option value='price-asc'>Price: Low → High</option>
              <option value='price-desc'>Price: High → Low</option>
              <option value='rating'>Top rated</option>
            </select>
          </div>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
          {paginated.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLocalAdd(p) } }}
              className='bg-white rounded shadow hover:shadow-lg transition p-3 flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-300'
            >
              <div className='flex-1 flex items-center justify-center'>
                <div className='relative w-28 h-28'>
                  {!imgLoaded[p.id] && (
                    <div className='absolute inset-0'>
                      <ProductSkeleton />
                    </div>
                  )}
                  <img
                    src={p.img + '?q=80&w=400&auto=format&fit=crop'}
                    srcSet={`${p.img}?q=80&w=300&auto=format&fit=crop 300w, ${p.img}?q=80&w=600&auto=format&fit=crop 600w, ${p.img}?q=80&w=1000&auto=format&fit=crop 1000w`}
                    sizes='(max-width: 640px) 50vw, 200px'
                    alt={p.name}
                    className={`w-28 h-28 object-contain transition-opacity duration-300 ${imgLoaded[p.id] ? 'opacity-100' : 'opacity-0'}`}
                    width={112}
                    height={112}
                    decoding='async'
                    loading='lazy'
                    onError={(e) => { e.target.src = '/images/product-1.svg' }}
                    onLoad={() => setImgLoaded(prev => ({ ...prev, [p.id]: true }))}
                  />
                </div>
              </div>
              <div className='mt-3 text-sm font-medium text-gray-800 truncate cursor-pointer' onClick={()=> handleOpenModal(p)}>{p.name}</div>
              <div className='mt-1 text-sm text-gray-500'>{DisplayPriceInRupees(p.price)}</div>
              <div className='mt-2 flex items-center justify-between'>
                {renderStars(p.rating)}
                <div className='flex items-center gap-2'>
                  <button onClick={() => handleLocalDecrease(p)} aria-label={`Decrease ${p.name}`} className='bg-gray-200 text-gray-800 px-2 py-1 rounded'>-</button>
                  <button onClick={() => handleLocalAdd(p)} aria-label={`Add ${p.name}`} className='bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700'>Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* pagination */}
        <div className='mt-4 flex items-center justify-center gap-2'>
          <button onClick={()=> setPage(p => Math.max(1, p-1))} disabled={page===1} className='px-3 py-1 bg-gray-200 rounded disabled:opacity-50'>Prev</button>
          <div>Page {page} / {totalPages}</div>
          <button onClick={()=> setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages} className='px-3 py-1 bg-gray-200 rounded disabled:opacity-50'>Next</button>
        </div>
      </div>

      <div className='container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10  gap-2'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((_,index)=>{
                return(
                  <div key={`${index}-loadingcategory`} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                    <div className='bg-blue-100 min-h-24 rounded'></div>
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.map((cat)=>{
                return(
                  <div key={`${cat._id}-displayCategory`} className='w-full h-full' onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}>
                    <div>
                        <img 
                          src={cat.image || '/images/product-1.svg'}
                          className='w-full h-full object-scale-down'
                          alt={cat.name || 'Category'}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/images/product-1.svg'
                          }}
                        />
                    </div>
                  </div>
                )
              })
              
            )
          }
      </div>

      {/***display category product */}
      {
        categoryData?.map((c)=>{
          return(
            <CategoryWiseProductDisplay 
              key={`${c?._id}-CategorywiseProduct`} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }



   </section>
  )
}

export default Home
