import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ VA AQUÍ (En la raíz del objeto, al mismo nivel que 'experimental' si lo tuvieras)
  reactCompiler: true, 
  
  // Si tienes otras configuraciones en el futuro, irían aquí abajo...
};

export default nextConfig;