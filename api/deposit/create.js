const {supabase,json,rumah,auth}=require("../_lib");
module.exports=async(req,res)=>{
  try{
    const a=auth(req), amount=Number(req.body?.amount);
    const min=Number(process.env.MIN_DEPOSIT||5000);
    if(!Number.isInteger(amount)||amount<min) throw new Error(`Minimal deposit Rp${min.toLocaleString("id-ID")}.`);
    const r=await rumah(`v1/deposit/create?amount=${amount}&payment_id=qris`);
    await supabase.from("deposits").insert({
      user_id:a.sub, provider_deposit_id:r.data.id, amount:r.data.amount,
      received:r.data.currency?.diterima || amount, status:"pending"
    });
    return json(res,201,r);
  }catch(e){return json(res,400,{success:false,error:{message:e.message}})}
};
