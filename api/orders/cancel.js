const {supabase,json,rumah,auth}=require("../_lib");
module.exports=async(req,res)=>{
  try{
    const a=auth(req), id=req.query.order_id;
    const {data:o}=await supabase.from("orders").select("*").eq("rumah_order_id",id).eq("user_id",a.sub).single();
    if(!o) throw new Error("Order tidak ditemukan.");
    const r=await rumah(`v1/orders/set_status?order_id=${encodeURIComponent(id)}&status=cancel`);
    if(o.status!=="canceled" && o.status!=="completed"){
      const {data:u}=await supabase.from("users").select("balance").eq("id",a.sub).single();
      await supabase.from("users").update({balance:Number(u.balance)+Number(o.retail_price)}).eq("id",a.sub);
      await supabase.from("orders").update({status:"canceled",updated_at:new Date().toISOString()}).eq("id",o.id);
    }
    return json(res,200,r);
  }catch(e){return json(res,400,{success:false,error:{message:e.message}})}
};
