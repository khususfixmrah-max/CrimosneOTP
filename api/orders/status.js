const {supabase,json,rumah,auth}=require("../_lib");
module.exports=async(req,res)=>{
  try{
    const a=auth(req), id=req.query.order_id;
    const {data:o}=await supabase.from("orders").select("*").eq("rumah_order_id",id).eq("user_id",a.sub).single();
    if(!o) throw new Error("Order tidak ditemukan.");
    const r=await rumah(`v1/orders/get_status?order_id=${encodeURIComponent(id)}`);
    await supabase.from("orders").update({
      status:r.data.status,otp_code:r.data.otp_code||null,otp_msg:r.data.otp_msg||null,updated_at:new Date().toISOString()
    }).eq("id",o.id);
    return json(res,200,{success:true,data:r.data});
  }catch(e){return json(res,400,{success:false,error:{message:e.message}})}
};
