const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase, json } = require("../_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, {success:false,error:{message:"Method not allowed"}});
  try {
    const { username, email, password } = req.body || {};
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username || "")) throw new Error("Username 3-24 karakter.");
    if (!/^\S+@\S+\.\S+$/.test(email || "")) throw new Error("Email tidak valid.");
    if (!password || password.length < 8) throw new Error("Password minimal 8 karakter.");

    const password_hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase.from("users")
      .insert({username, email: email.toLowerCase(), password_hash})
      .select("id,username,email,balance").single();
    if (error) throw new Error(error.code === "23505" ? "Username atau email sudah terdaftar." : error.message);

    const token = jwt.sign({sub:data.id, username:data.username}, process.env.JWT_SECRET, {expiresIn:"7d"});
    return json(res, 201, {success:true,data:{user:data,token}});
  } catch(e) { return json(res, 400, {success:false,error:{message:e.message}}); }
};
