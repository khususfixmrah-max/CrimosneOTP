const {supabase,json,rumah,auth}=require("../_lib");
module.exports=async(req,res)=>{
  try{
    const a=auth(req), id=req.query.deposit_id;
    if(!id) throw new Error("deposit_id wajib.");
    const {data:d}=await supabase.from("deposits").select("*").eq("provider_deposit_id",id).eq("user_id",a.sub).single();
    if(!d) throw new Error("Deposit tidak ditemukan.");
    const r=await rumah(`v1/deposit/get_status?deposit_id=${encodeURIComponent(id)}`);
    const status=r.data.status;
    if(status==="success" && d.status!=="success"){
      const credit=Number(r.data.amount||d.received||d.amount);
      const {data:u}=await supabase.from("users").select("balance").eq("id",a.sub).single();
      await supabase.from("users").update({balance:Number(u.balance)+credit}).eq("id",a.sub);
    }
    await supabase.from("deposits").update({status,received:Number(r.data.amount||d.received),updated_at:new Date().toISOString()}).eq("id",d.id);
    return json(res,200,r);
  }catch(e){return json(res,400,{success:false,error:{message:e.message}})}
};
