const {supabase,json,rumah,auth}=require("../_lib");
module.exports=async(req,res)=>{
  try{
    const a=auth(req);
    const {number_id,provider_id,operator_id,service_code,service_name,country_name}=req.body||{};
    if(!number_id||!provider_id||!operator_id) throw new Error("Parameter order belum lengkap.");
    const countries=await rumah(`v2/countries?service_id=${encodeURIComponent(service_code)}`);
    const country=(countries.data||[]).find(x=>String(x.number_id)===String(number_id));
    if(!country) throw new Error("Negara tidak tersedia.");
    const provider=(country.pricelist||[]).find(x=>String(x.provider_id)===String(provider_id));
    if(!provider || provider.available===false || Number(provider.stock)<=0) throw new Error("Stok/provider tidak tersedia.");
    const cost=Number(provider.price);
    const markup=Math.max(0,Number(process.env.OTP_MARKUP_PERCENT||25));
    const retail=Math.ceil(cost*(1+markup/100)/100)*100;

    const {data:u}=await supabase.from("users").select("balance").eq("id",a.sub).single();
    if(Number(u.balance)<retail) throw new Error("Saldo tidak cukup.");

    // Reserve user funds before requesting the provider order.
    const {data:dec,error:decErr}=await supabase.from("users").update({balance:Number(u.balance)-retail}).eq("id",a.sub).gte("balance",retail).select("balance").single();
    if(decErr||!dec) throw new Error("Saldo berubah, silakan coba lagi.");

    try{
      const r=await rumah(`v2/orders?number_id=${encodeURIComponent(number_id)}&provider_id=${encodeURIComponent(provider_id)}&operator_id=${encodeURIComponent(operator_id)}`);
      const o=r.data;
      const {data:row,error}=await supabase.from("orders").insert({
        user_id:a.sub, rumah_order_id:o.order_id, service_code, service_name:service_name||o.service,
        country_id:number_id, country_name:country_name||o.country, provider_id, operator_id,
        phone_number:o.phone_number, cost, retail_price:retail, status:o.status||"received"
      }).select("*").single();
      if(error) throw error;
      await supabase.from("profit_ledger").insert({order_id:row.id,provider_cost:cost,retail_price:retail,profit:retail-cost});
      return json(res,201,{success:true,data:{...o,retail_price:retail}});
    }catch(e){
      const {data:uu}=await supabase.from("users").select("balance").eq("id",a.sub).single();
      await supabase.from("users").update({balance:Number(uu.balance)+retail}).eq("id",a.sub);
      throw e;
    }
  }catch(e){return json(res,400,{success:false,error:{message:e.message}})}
};
