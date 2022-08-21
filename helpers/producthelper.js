const catagorymodel = require('../model/catagory');
const SubCatagorymodel = require('../model/subcatagory')
const Productmodel = require('../model/product');
const mongoose = require('mongoose');

module.exports = {

    addCatagory: (newCatagory) => {
        const { catagory } = newCatagory
        console.log(catagory)
        let catagoryName = catagory.toLowerCase()
        return new Promise(async (resolve, reject) => {

            let catagoryExist = await catagorymodel.findOne({ catagory: catagoryName })

            if (!catagoryExist) {
                productCatagory = new catagorymodel({
                    catagory
                })

                productCatagory.save().then((data) => {
                    resolve(data)
                })
            } else {

                let data = null
                resolve(data)
            }
        })
    },
    showCatagory: () => {

        return new Promise((resolve, reject) => {
            catagorymodel.find({}).lean().then((catagory) => { resolve(catagory) }).catch((err) => { reject(err) })



        })
    },
    editCatagory: (catagoryId, catagoryData) => {

        let catagoryName = catagoryData.catagory.toLowerCase()

        return new Promise(async (resolve, reject) => {
            let catagory = await catagorymodel.findOne({ catagory: catagoryName })
            if (catagory) {
                let response = null
                resolve(response)

            } else {
                catagorymodel.findByIdAndUpdate(catagoryId, { catagory: catagoryName }).then((response) => {
                    resolve(response)
                })
            }



        })
    },
    showSubCatagory: () => {

        return new Promise(async (resolve, reject) => {
            let subCatagory = await SubCatagorymodel.find({}).lean()

            resolve(subCatagory)

        })
    }
    ,
    ShowSubCatagory: (id) => {


        let ObjectID = mongoose.Types.ObjectId(id);

        return new Promise(async (resolve, reject) => {
            let subCatagory = await SubCatagorymodel.find({ Catagory: ObjectID }).lean()

            resolve(subCatagory)

        })
    },
    addSubCatagory: (newSubCatagory) => {
        const { subCatagory, Catagory } = newSubCatagory

        return new Promise((resolve, reject) => {


            productSubCatagory = new SubCatagorymodel({
                subCatagory,
                Catagory
            })

            productSubCatagory.save().then((data) => {
                resolve(data)
            })
        })
    },
    addProduct: (product) => {
        let {
            title,
            author,
            publisher,
            rating,
            description,
            aboutAuthor,
            catagory,
            subCatogory,
            PremiumLevel,
            stock,
        } = product



        console.log(catagory + "  sd  " + subCatogory)
        return new Promise((resolve, reject) => {


            products = new Productmodel({
                title,
                author,
                publisher,
                rating,
                description,
                aboutAuthor,
                catagory,
                subCatogory,
                PremiumLevel,
                stock,

            })

            products.save().then((data) => {
                resolve(data._id)
            })
        })
    },
    showAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await Productmodel.find().populate('subCatogory').populate('catagory').lean()
                resolve(product)
            } catch (err) {
                reject(err)
            }
        })
    },
    deleteProduct: (productid) => {
        return new Promise((resolve, reject) => {
            console.log(productid)
            Productmodel.findByIdAndDelete(productid).then((response) => {
                resolve(response)
                console.log(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    showProduct: (productid) => {
        return new Promise(async (resolve, reject) => {

            Productmodel.findById(productid).populate('subCatogory').populate('catagory').lean().then((products) => {
                resolve(products)
            }).catch((err) => reject(err))


        })
    },


    updateProduct: (productid, productData) => {
        return new Promise(async (resolve, reject) => {

            Productmodel.findByIdAndUpdate(productid,
                {
                    title: productData.title,
                    author: productData.author,
                    publisher: productData.publisher,
                    rating: productData.rating,
                    catagory: productData.catagory,
                    subCatogory: productData.subCatogory,
                    PremiumLevel: productData.PremiumLevel,
                    stock: productData.stock,
                    description: productData.description,
                    aboutAuthor: productData.aboutAuthor,


                }).then((response) => {
                    console.log(response)
                    resolve(response)
                })


        })
    }

}