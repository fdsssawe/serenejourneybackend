import Offer from "../model/Post.js";

export const getAllOffers = async (req,res,) => {
    try{
        const offersList = await Offer.find();

        res.json(offersList)
    }catch (err){
        console.log(err);
        res.json({
            message: "Error while finding offers or no offers yet",
        })
    }
}

export const create = async (req , res) => {
    try{
        const doc = new Offer({
            name : req.body.name,
            description: req.body.description,
            exchange: req.body.exchange,
            mail: req.body.mail,
        })
        const offersItem = await doc.save();

        res.json(offersItem)
    }
    catch (err){
        console.log(err)
        res.status(500).json(
            {
                message: "no offer added",
            }
        )
    }
}