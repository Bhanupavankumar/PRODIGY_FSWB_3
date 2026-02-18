import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

// ADD ADDRESS
export const addAddressController = async (req, res) => {
    try {
        const userId = req.userId;  // assume middleware sets req.userId
        const { address_line, city, state, pincode, country, mobile } = req.body;

        const createAddress = new AddressModel({ address_line, city, state, pincode, country, mobile, userId });
        const saveAddress = await createAddress.save();

        await UserModel.findByIdAndUpdate(userId, { $push: { address_details: saveAddress._id } });

        res.json({ message: "Address Created Successfully", success: true, error: false, data: saveAddress });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false, error: true });
    }
};

// GET ADDRESSES
export const getAddressController = async (req, res) => {
    try {
        const userId = req.userId;
        const data = await AddressModel.find({ userId, status: true }).sort({ createdAt: -1 });
        res.json({ message: "List of addresses", success: true, error: false, data });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false, error: true });
    }
};

// UPDATE ADDRESS
export const updateAddressController = async (req, res) => {
    try {
        const userId = req.userId;
        const { _id, address_line, city, state, country, pincode, mobile } = req.body;

        const updateAddress = await AddressModel.updateOne({ _id, userId }, { address_line, city, state, country, pincode, mobile });

        if (updateAddress.matchedCount === 0) {
            return res.status(404).json({ message: "Address not found", success: false, error: true });
        }

        res.json({ message: "Address Updated", success: true, error: false, data: updateAddress });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false, error: true });
    }
};

// DELETE (SOFT DELETE) ADDRESS
export const deleteAddressController = async (req, res) => {
    try {
        const userId = req.userId;
        const { _id } = req.body;

        const deleteAddress = await AddressModel.updateOne({ _id, userId }, { status: false });

        if (deleteAddress.matchedCount === 0) {
            return res.status(404).json({ message: "Address not found", success: false, error: true });
        }

        await UserModel.findByIdAndUpdate(userId, { $pull: { address_details: _id } });

        res.json({ message: "Address Removed", success: true, error: false });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false, error: true });
    }
};
