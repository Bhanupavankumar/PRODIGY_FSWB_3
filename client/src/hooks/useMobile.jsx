import React, { useEffect, useState } from "react"

const useMobile = (breakpoint = 768)=>{
    const [isMobile,setIsMobile] = useState(window.innerWidth < breakpoint)

    useEffect(()=>{
        const handleResize = ()=>{
            const checkpoint = window.innerWidth < breakpoint
            setIsMobile(checkpoint)
        }

        handleResize()

        window.addEventListener('resize',handleResize)

        return ()=>{
            window.removeEventListener('resize',handleResize)
        }
    },[breakpoint])

    return [ isMobile ]
}

export default useMobile
