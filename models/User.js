import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    zip: { type: String, required: false }, // Optional field
    profile_picture: { type: String, required: false }, // Optional field
    role_id: { type: String, required: false }, // Optional field
    outletname: { type: String, required: false }, // Optional field
    pin: { type: String, required: false }, // Optional field
    legal_entity: { type: String, required: false }, // Optional field
    owner: { type: String, required: false }, // Optional field
    cc_number: { type: String, required: false }, // Optional field
    contact_name: { type: String, required: false }, // Optional field
    outlet_add: { type: String, required: false }, // Optional field
    gst: { type: String, required: false }, // Optional field
    delevery_radius: { type: String, required: false }, // Optional field
    billing_amount_anydel: { type: Number, required: false }, // Optional field
    min_amount: { type: Number, required: false }, // Optional field
    reg_add: { type: String, required: false }, // Optional field


});

const User = mongoose.model('User', userSchema);

export default User;
