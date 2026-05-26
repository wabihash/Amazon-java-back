import React, { useEffect, useState } from 'react'
import classes from './Results.module.css'
import LayOut from '../../Components/LayOut/LayOut'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { productUrl } from '../../API/Endpoint'
import ProductCard from '../../Components/Product/ProductCard'
import SkeletonCard from '../../Components/Loader/Skeleton'

function Results() {
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [allProducts, setAllProducts] = useState([])
    const { categoryName, searchQuery } = useParams()
    const [searchParams] = useSearchParams()
    const searchTerm = searchParams.get('search')
    // Fetch all products for search functionality
    useEffect(() => {
        axios.get(`${productUrl}/products`) 
            .then((res) => {
                setAllProducts(res.data)
            })
            .catch(() => {
            })
    }, [])

    useEffect(() => {
        setLoading(true)

        if (searchQuery) {
            // Handle search query
            const filteredProducts = allProducts.filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setResults(filteredProducts)
            setLoading(false)
        } else if (categoryName && searchTerm) {
            // Handle category with search
            axios.get(`${productUrl}/products/category/${categoryName}`)
                .then((res) => {
                    const filteredProducts = res.data.filter(product =>
                        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    setResults(filteredProducts)
                    setLoading(false)
                })
                .catch(() => {
                    setLoading(false)
                })
        } else if (categoryName) {
            // Handle category only
            axios.get(`${productUrl}/products/category/${categoryName}`)
                .then((res) => {
                    setResults(res.data)
                    setLoading(false)
                })
                .catch(() => {
                    setLoading(false)
                })
        }
    }, [categoryName, searchQuery, searchTerm, allProducts])

    if (loading) {
        return (
            <LayOut>
                <section className={classes.results_section}>
                    <h1 className={classes.results_title} style={{ width: '300px', height: '35px', backgroundColor: '#eee', borderRadius: '4px' }}></h1>
                    <p className={classes.results_category} style={{ width: '150px', height: '20px', backgroundColor: '#eee', borderRadius: '4px', marginTop: '10px' }}></p>
                    <hr />
                    <div className={classes.products_container}>
                        {[...Array(8)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </section>
            </LayOut>
        )
    }

    const getTitle = () => {
        if (searchQuery) return `Search results for "${searchQuery}"`
        if (categoryName && searchTerm) return `Results for "${searchTerm}" in ${categoryName}`
        if (categoryName) return `Category: ${categoryName}`
        return 'Results'
    }

    const getSubtitle = () => {
        if (searchQuery) return `${results.length} results found`
        if (categoryName && searchTerm) return `Category / ${categoryName} / Search: ${searchTerm}`
        if (categoryName) return `Category / ${categoryName}`
        return ''
    }

    return (
        <LayOut>
            <section className={classes.results_section}>
                <h1 className={classes.results_title}>{getTitle()}</h1>
                <p className={classes.results_category}>{getSubtitle()}</p>
                <hr />
                <div className={classes.products_container}>
                    {results.length > 0 ? (
                        results.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                renderAdd={true}
                            />
                        ))
                    ) : (
                        <p className={classes.no_results}>No products found matching your search.</p>
                    )}
                </div>
            </section>
        </LayOut>
    )
}

export default Results

