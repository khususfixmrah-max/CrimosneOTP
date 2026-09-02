const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase, json } = require("../_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res,405,{success:false,error:{message:"Method not allowed"}});
  try {
    const { email, password } = req.body || {};
    const { data:user, error } = await supabase.from("users").select("*").eq("email", (email||"").toLowerCase()).single();
    if (error || !user || !(await bcrypt.compare(password || "", user.password_hash))) throw new Error("Email atau password salah.");
    const token = jwt.sign({sub:user.id,username:user.username}, process.env.JWT_SECRET,{expiresIn:"7d"});
    return json(res,200,{success:true,data:{user:{id:user.id,username:user.username,email:user.email,balance:user.balance},token}});
  } catch(e) { return json(res,401,{success:false,error:{message:e.message}}); }
};
