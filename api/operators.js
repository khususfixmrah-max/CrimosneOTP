const {json,rumah}=require("./_lib");
module.exports=async(req,res)=>{
  try{
    const {country,provider_id}=req.query;
    if(!country||!provider_id) throw new Error("country dan provider_id wajib.");
    return json(res,200,await rumah(`v2/operators?country=${encodeURIComponent(country)}&provider_id=${encodeURIComponent(provider_id)}`));
  }catch(e){return json(res,400,{success:false,error:{message:e.message}})}
};
