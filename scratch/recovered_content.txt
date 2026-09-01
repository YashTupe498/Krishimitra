Created At: 2026-08-31T00:51:31+05:30
Completed At: 2026-08-31T00:51:34+05:30
The following changes were made by the replace_file_content tool to: c:\Users\VICTUS\Krishimitra\src\pages\farmer\MarketIntelligencePage.tsx. If relevant, proactively run terminal commands to execute this code for the USER. Don't ask for permission.
[diff_block_start]
@@ -625,219 +625,149 @@
 
         </section>
 
-        {/* 6. MARKET CONDITIONS */}
-        <section className="w-full">
-          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
-            <div className={level2Signal + " !p-8"}>
-              <div className="flex items-center gap-3 mb-6">
-                <Activity size={18} className="text-gray-400" />
-                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Market Pressure</h3>
-              </div>
-              
-              {frontendPressure.level === 'INSUFFICIENT' ? (
-                <div>
-                  <p className="text-lg font-bold text-gray-900 mb-2">{frontendPressure.title}</p>
-                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{frontendPressure.description}</p>
-                </div>
-              ) : (
-                <div>
-                  <p className="text-2xl font-bold text-gray-900 capitalize mb-2">{frontendPressure.title}</p>
-                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{frontendPressure.description}</p>
-                  {frontendPressure.basis && <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-widest">{frontendPressure.basis}</p>}
-                </div>
-              )}
-            </div>
-
-            <div className={level2Signal + " !p-8"}>
-              <div className="flex items-center gap-3 mb-6">
-                <Calendar size={18} className="text-gray-400" />
-                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Selling Window</h3>
-              </div>
-              
-              {frontendWindow.level === 'INSUFFICIENT' ? (
-                <div>
-                  <p className="text-lg font-bold text-gray-900 mb-2">{frontendWindow.title}</p>
-                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{frontendWindow.description}</p>
-                </div>
-              ) : (
-                <div>
-                  <p className="text-2xl font-bold text-gray-900 mb-2">{frontendWindow.title}</p>
-                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{frontendWindow.description}</p>
-                  {frontendWindow.basis && <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-widest">{frontendWindow.basis}</p>}
-                </div>
-              )}
-            </div>
-          </div>
-        </section>
-
-        {/* 7. MARKET OPPORTUNITY */}
-        <section className={level1Card + " relative overflow-hidden"}>
-          <div className="absolute top-0 right-0 p-8 opacity-5">
-            <Target size={120} />
-          </div>
-          <div className="relative z-10">
-            <div className="flex items-center gap-3 mb-6">
-              <div className="w-1 h-5 bg-brand-primary rounded-full"></div>
-              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Market Opportunity</h2>
-            </div>
-            
-            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
-              <div className="md:col-span-1">
-                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Highest Reported Price Market</p>
-                <p className="text-2xl font-bold text-gray-900 mb-1">{highestMarket.market_name}</p>
-                <p className="text-sm font-medium text-gray-500">₹{highestPrice.toLocaleString()}/q</p>
-              </div>
-              
-              <div className="md:col-span-2">
-                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Opportunity Score</p>
-                {opportunity.status === 'UNAVAILABLE' ? (
-                  <p className="text-sm font-medium text-gray-500">Opportunity score unavailable</p>
-                ) : (
-                  <div className="flex items-start gap-4">
-                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-100 text-green-700 font-bold text-lg shrink-0">
+        {/* ROW 5: OPPORTUNITY & BUYERS */}
+        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
+          
+          <div className={`xl:col-span-4 ${premiumCard} flex flex-col justify-between`}>
+             <div className="flex items-center justify-between mb-4">
+               <h3 className={premiumHeader + " !mb-0"}><Target size={14}/> Market Opportunity</h3>
+             </div>
+             
+             {opportunity.status === 'UNAVAILABLE' ? (
+                <div className={premiumEmpty}>
+                  <Target className="w-6 h-6 text-gray-300 mb-3" />
+                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Opportunity score unavailable</p>
+                </div>
+             ) : (
+                <div className="flex flex-col h-full">
+                  <div className="flex items-center gap-4 mb-4">
+                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50 text-green-700 font-bold text-2xl shrink-0 border border-green-100">
                       {opportunity.score}
                     </div>
                     <div>
-                      <p className="text-base font-bold text-gray-900 mb-1">{opportunity.status} OPPORTUNITY</p>
-                      <ul className="text-xs font-medium text-gray-600 space-y-1">
+                      <p className="text-xl font-bold text-gray-900 mb-1">{opportunity.status} <span className="text-sm font-bold text-gray-500">OPPORTUNITY</span></p>
+                    </div>
+                  </div>
+                  <div className="bg-gray-50 rounded-xl p-4 flex-1">
+                     <ul className="text-xs font-medium text-gray-600 space-y-2">
                         {opportunity.reasons.map((r, i) => (
-                          <li key={i} className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500"/> {r}</li>
-                        ))}
+                          <li key={i} className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5"/> {r}</li>
+                        ))}
+                     </ul>
+                  </div>
+                </div>
+             )}
+          </div>
+
+          <div className={`xl:col-span-4 ${premiumCard} flex flex-col justify-between`}>
+             <div className="flex items-center justify-between mb-4">
+               <h3 className={premiumHeader + " !mb-0"}><ShoppingBag size={14}/> Buyer Demand</h3>
+               <span className={`${premiumPill} bg-green-50 text-green-700`}>{buyerDemands.length} Active</span>
+             </div>
+             
+             {demandsLoading ? (
+                <div className={premiumEmpty}>
+                  <RefreshCw className="w-5 h-5 text-gray-300 animate-spin" />
+                </div>
+             ) : demandsError || buyerDemands.length === 0 ? (
+                <div className={premiumEmpty}>
+                  <ShoppingBag className="w-6 h-6 text-gray-300 mb-3" />
+                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Demand data unavailable</p>
+                </div>
+             ) : (
+                <div className="flex flex-col gap-3 flex-1">
+                   {buyerDemands.slice(0, 3).map(demand => (
+                     <div key={demand.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">
+                       <div className="flex justify-between items-start mb-1.5">
+                         <p className="text-[11px] font-bold text-gray-900 truncate">Verified Buyer</p>
+                         <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-100 text-green-800 rounded uppercase tracking-widest">Active</span>
+                       </div>
+                       <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
+                         <span>{demand.quantityRequired} {demand.quantityUnit}</span>
+                         <span>Grade {demand.acceptedQualityGrades[0]}</span>
+                         <span>{demand.district}</span>
+                       </div>
+                     </div>
+                   ))}
+                </div>
+             )}
+          </div>
+
+          <div className={`xl:col-span-4 ${premiumCard} flex flex-col justify-between relative overflow-hidden group`}>
+             <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
+                <Star size={100} />
+             </div>
+             <div className="relative z-10 flex flex-col h-full">
+               <div className="flex items-center justify-between mb-4">
+                 <h3 className={premiumHeader + " !mb-0"}><Star size={14}/> Best Buyer Match</h3>
+               </div>
+               
+               {demandsLoading ? (
+                  <div className={premiumEmpty}>
+                    <RefreshCw className="w-5 h-5 text-gray-300 animate-spin" />
+                  </div>
+               ) : !lotContext || !bestMatch || !bestMatchDemand ? (
+                  <div className={premiumEmpty}>
+                    <Star className="w-6 h-6 text-gray-300 mb-3" />
+                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Match data unavailable</p>
+                  </div>
+               ) : (
+                  <div className="flex flex-col h-full">
+                    <div className="flex items-baseline gap-2 mb-4">
+                      <span className="text-4xl font-bold text-gray-900 tracking-tight">{bestMatch.matchPercentage}%</span>
+                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Match</span>
+                    </div>
+                    
+                    <div className="bg-green-50/50 rounded-xl p-4 flex-1 mb-4 border border-green-100/50">
+                      <ul className="text-[11px] font-bold text-gray-700 space-y-2 uppercase tracking-wide">
+                        {bestMatch.reasons.map((r, i) => (
+                          <li key={i} className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> {r}</li>
+                        ))}
+                        {bestMatch.matchPercentage < 100 && (
+                          <li className="flex items-center gap-2 text-amber-600"><ShieldAlert size={12} /> Partial requirements met</li>
+                        )}
                       </ul>
                     </div>
-                  </div>
-                )}
-              </div>
-            </div>
-          </div>
-        </section>
-
-        {/* 8 & 9. BUYER DEMAND & MATCHING */}
-        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
-          <div className={level2Signal + " !p-8"}>
-            <div className="flex items-center justify-between mb-6">
-              <div className="flex items-center gap-3">
-                <ShoppingBag size={18} className="text-gray-400" />
-                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Buyer Demand</h3>
-              </div>
-            </div>
-            
-            {demandsLoading ? (
-              <div className="flex items-center justify-center py-8">
-                <RefreshCw size={20} className="text-gray-300 animate-spin" />
-              </div>
-            ) : demandsError || buyerDemands.length === 0 ? (
-              <div className="py-4">
-                <p className="text-sm font-bold text-gray-900 mb-1">Buyer demand data unavailable</p>
-                <p className="text-xs text-gray-500 font-medium">No verified active buyer requirements found for this crop.</p>
-              </div>
-            ) : (
-              <div className="space-y-4">
-                <p className="text-sm font-bold text-gray-900 mb-4">{buyerDemands.length} matching buyers found</p>
-                {buyerDemands.slice(0, 2).map(demand => (
-                  <div key={demand.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
-                    <div className="flex justify-between items-start mb-2">
-                      <p className="text-sm font-bold text-gray-900 truncate">Verified Buyer</p>
-                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full">ACTIVE</span>
-                    </div>
-                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
-                      <span>{demand.quantityRequired} {demand.quantityUnit}</span>
-                      <span>Grade {demand.acceptedQualityGrades[0]}</span>
-                      <span>{demand.district}</span>
-                    </div>
-                  </div>
-                ))}
-              </div>
-            )}
-          </div>
-
-          <div className={level2Signal + " !p-8"}>
-            <div className="flex items-center gap-3 mb-6">
-              <Star size={18} className="text-gray-400" />
-              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Best Buyer Match</h3>
-            </div>
-            
-            {demandsLoading ? (
-              <div className="flex items-center justify-center py-8">
-                <RefreshCw size={20} className="text-gray-300 animate-spin" />
-              </div>
-            ) : !lotContext ? (
-               <div className="py-4">
-                <p className="text-sm font-bold text-gray-900 mb-1">Match data unavailable</p>
-                <p className="text-xs text-gray-500 font-medium">Farmer lot context is missing.</p>
-              </div>
-            ) : !bestMatch || !bestMatchDemand ? (
-              <div className="py-4">
-                <p className="text-sm font-bold text-gray-900 mb-1">Match data unavailable</p>
-                <p className="text-xs text-gray-500 font-medium">No suitable buyers found to calculate a match.</p>
-              </div>
-            ) : (
-              <div>
-                <div className="flex items-baseline gap-2 mb-4">
-                  <span className="text-3xl font-bold text-gray-900">{bestMatch.matchPercentage}%</span>
-                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Match</span>
-                </div>
-                
-                <ul className="text-xs font-medium text-gray-600 space-y-2 mb-6">
-                  {bestMatch.reasons.map((r, i) => (
-                    <li key={i} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> {r}</li>
-                  ))}
-                  {bestMatch.matchPercentage < 100 && (
-                    <li className="flex items-center gap-2 text-amber-600"><ShieldAlert size={14} /> Partial requirements met</li>
-                  )}
-                </ul>
-                
-                <button 
-                  onClick={() => navigate('/farmer/marketplace')}
-                  className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-sm font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
-                >
-                  View Opportunity <ChevronRight size={16} />
-                </button>
-              </div>
-            )}
-          </div>
-        </section>
-
-        {/* 10 & 11. QUALITY + LOGISTICS & STORAGE */}
-        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
-          <div className={level1Card + " !p-8 md:col-span-1 flex flex-col"}>
-            <div className="flex items-center gap-3 mb-6">
-              <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
-              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quality</h3>
-            </div>
+                    
+                    <button 
+                      onClick={() => navigate('/farmer/marketplace')}
+                      className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-sm font-bold py-2.5 rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm mt-auto"
+                    >
+                      View Opportunity <ChevronRight size={16} />
+                    </button>
+                  </div>
+               )}
+             </div>
+          </div>
+        </section>
+
+        {/* ROW 6: QUALITY, LOGISTICS, STORAGE */}
+        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
+          <div className={premiumCard}>
+            <h3 className={premiumHeader}><ShieldAlert size={14}/> Quality</h3>
             {lotContext?.qualityGrade ? (
-              <div>
-                <p className="text-sm font-medium text-gray-500 mb-1">Your Lot Grade</p>
-                <p className="text-2xl font-bold text-gray-900 mb-4">Grade {lotContext.qualityGrade}</p>
-                <p className="text-xs font-medium text-gray-500">Other quality requirements unavailable.</p>
-              </div>
-            ) : (
-              <div>
-                <p className="text-sm font-bold text-gray-900 mb-1">Quality data unavailable</p>
-              </div>
-            )}
-          </div>
-          
-          <div className={level1Card + " !p-8 md:col-span-1 flex flex-col"}>
-            <div className="flex items-center gap-3 mb-6">
-              <Truck size={16} className="text-gray-400" />
-              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Logistics</h3>
-            </div>
-            <div className="flex-1 flex flex-col justify-center">
-              <p className="text-sm font-bold text-gray-900 mb-2">Data unavailable</p>
-              <p className="text-xs text-gray-500 font-medium leading-relaxed">Transport cost and net realization can be estimated when logistics information is available.</p>
-            </div>
-          </div>
-          
-          <div className={level1Card + " !p-8 md:col-span-1 flex flex-col"}>
-            <div className="flex items-center gap-3 mb-6">
-              <Box size={16} className="text-gray-400" />
-              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Storage</h3>
-            </div>
-            <div className="flex-1 flex flex-col justify-center">
-              <p className="text-sm font-bold text-gray-900 mb-2">Storage information unavailable</p>
-              <p className="text-xs text-gray-500 font-medium leading-relaxed">Consider storage cost and quality risk before delaying the sale.</p>
-            </div>
+              <div className="flex items-center gap-4">
+                 <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-900 text-lg">
+                   {lotContext.qualityGrade}
+                 </div>
+                 <div>
+                   <p className="text-sm font-bold text-gray-900">Grade {lotContext.qualityGrade}</p>
+                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Lot Grade</p>
+                 </div>
+              </div>
+            ) : (
+              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data unavailable</p>
+            )}
+          </div>
+          
+          <div className={premiumCard}>
+            <h3 className={premiumHeader}><Truck size={14}/> Logistics</h3>
+            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data unavailable</p>
+          </div>
+          
+          <div className={premiumCard}>
+            <h3 className={premiumHeader}><Box size={14}/> Storage</h3>
+            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Information unavailable</p>
           </div>
         </section>
 
@@ -844,4 +844,4 @@
-        <section className="relative bg-brand-primary text-white rounded-2xl p-8 md:p-12 overflow-hidden shadow-lg border border-green-800">
+        <section className="relative bg-brand-primary text-white rounded-[14px] p-8 md:p-10 overflow-hidden shadow-lg border border-green-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
@@ -848,9 +848,9 @@
                <div className="flex items-center gap-2 mb-4">
-                 <Lightbulb size={18} className="text-green-300" />
-                 <h2 className="text-[11px] font-bold text-green-300 uppercase tracking-widest">KrishiMitra's Recommendation</h2>
-               </div>
-               
-               <p className="text-2xl md:text-3xl font-bold leading-tight mb-6">
+                 <Lightbulb size={16} className="text-green-300" />
+                 <h2 className="text-[10px] font-bold text-green-300 uppercase tracking-widest">KrishiMitra's Recommendation</h2>
+               </div>
+               
+               <p className="text-2xl md:text-3xl font-bold leading-tight mb-6 max-w-xl">
                  {frontendWindow.level === 'FAVORABLE' ? "Consider selling within the next 3–5 days." :
                   frontendWindow.level === 'CAUTION' ? "Current conditions suggest waiting if storage allows." :
                   "Monitor the market closely for clearer momentum."}
@@ -878,13 +878,13 @@
              
              {/* 13. ASK KRISHIMITRA / MARKET WATCH */}
              <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
-               <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
-                 <div className="flex items-center gap-2 mb-4">
-                   <MessageSquare size={16} className="text-white" />
-                   <h3 className="text-sm font-bold text-white">Ask KrishiMitra</h3>
-                 </div>
-                 <p className="text-xs text-green-100 font-medium mb-4">Future capability: Ask voice assistant about this recommendation.</p>
-                 <button disabled className="w-full bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed">
+               <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
+                 <div className="flex items-center gap-2 mb-2">
+                   <MessageSquare size={14} className="text-white" />
+                   <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">Ask KrishiMitra</h3>
+                 </div>
+                 <p className="text-[10px] text-green-100 font-medium mb-4 uppercase tracking-widest">Future capability</p>
+                 <button disabled className="w-full bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed uppercase tracking-wider">
                    🎙 Voice Assistant
                  </button>
                </div>
@@ -891,7 +891,7 @@
-               <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
-                 <h3 className="text-sm font-bold text-white mb-2">Market Watch</h3>
-                 <p className="text-xs text-green-100 font-medium mb-4">Future capability: Set alerts for price or demand changes.</p>
-                 <button disabled className="w-full bg-transparent border border-white/30 text-white text-xs font-bold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed">
+               <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
+                 <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-2">Market Watch</h3>
+                 <p className="text-[10px] text-green-100 font-medium mb-4 uppercase tracking-widest">Future capability</p>
+                 <button disabled className="w-full bg-transparent border border-white/30 text-white text-xs font-bold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed uppercase tracking-wider">
                    Set Market Alert
                  </button>
                </div>
@@ -899,21 +899,21 @@
         </section>
 
         {/* 7. WHAT DOES THIS MEAN? */}
-        <section className={level1Card + " !p-0 overflow-hidden"}>
-          <div className="border-b border-gray-100 p-8 md:px-12 bg-gray-50/50">
-            <h2 className="text-xl font-bold text-gray-900 mb-1">What does this mean?</h2>
-            <p className="text-sm font-medium text-gray-500">A simple explanation of the available market information.</p>
-          </div>
-          
-          <div className="p-8 md:p-12">
-            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
-              <div className="flex items-start gap-4">
-                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
+        <section className={premiumCard + " !p-0 overflow-hidden"}>
+          <div className="border-b border-gray-100 p-6 bg-gray-50/50">
+            <h2 className="text-sm font-bold text-gray-900 mb-1">What does this mean?</h2>
+            <p className="text-xs font-medium text-gray-500">A simple explanation of the available market information.</p>
+          </div>
+          
+          <div className="p-6">
+            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
+              <div className="flex items-start gap-4">
+                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                   <TrendingUp size={14} className="text-gray-500" />
                 </div>
                 <div>
-                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Prices</h3>
-                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
+                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Prices</h3>
+                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                     {data.trend.direction === 'UP' && "Recent observed prices are moving upward."}
                     {data.trend.direction === 'DOWN' && "Recent observed prices are moving downward."}
                     {data.trend.direction === 'STABLE' && "Recent observed prices are relatively stable."}
@@ -922,12 +922,12 @@
               </div>
 
               <div className="flex items-start gap-4">
-                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
+                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                   <Package size={14} className="text-gray-500" />
                 </div>
                 <div>
-                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Arrivals</h3>
-                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
+                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Arrivals</h3>
+                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                     {displayArrivalValue !== null ? "Arrival information is available only for selected historical observations." : "Arrival data is currently unavailable."}
                   </p>
                 </div>
@@ -934,11 +934,11 @@
 
               <div className="flex items-start gap-4">
-                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
+                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                   <Activity size={14} className="text-gray-500" />
                 </div>
                 <div>
-                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Market Pressure</h3>
-                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
+                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Market Pressure</h3>
+                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                     {frontendPressure.level === 'INSUFFICIENT' ? "Not enough data to confidently assess current supply pressure." : 
                      frontendPressure.level === 'HIGH' ? "Recent market observations indicate tighter supply conditions." :
                      frontendPressure.level === 'LOW' ? "Recent market observations indicate softer supply conditions." :
@@ -947,12 +947,12 @@
               </div>
 
               <div className="flex items-start gap-4">
-                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
+                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                   <Calendar size={14} className="text-gray-500" />
                 </div>
                 <div>
-                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Selling Window</h3>
-                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
+                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Selling Window</h3>
+                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                     {frontendWindow.level === 'INSUFFICIENT' ? "Not enough information to identify a confident selling window." : 
                      frontendWindow.level === 'FAVORABLE' ? "Price momentum and supply conditions currently indicate a relatively favorable near-term selling environment." :
                      frontendWindow.level === 'CAUTION' ? "Current conditions suggest caution. Consider holding if possible." :
@@ -964,19 +964,19 @@
         </section>
 
         {/* 8. DATA & SOURCE */}
-        <section className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold text-gray-400 pt-4 border-t border-gray-200/50">
+        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold text-gray-400 pt-4 border-t border-gray-200/50">
           <div className="flex items-center gap-2">
             <Database size={14} />
-            <span>DATA & SOURCE</span>
-          </div>
-          <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-2 text-[11px] tracking-wide">
-            <span className="uppercase text-gray-500 tracking-widest">Latest observation: {data.observation_date}</span>
+            <span className="uppercase tracking-widest text-[10px]">DATA & SOURCE</span>
+          </div>
+          <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-2 text-[10px] tracking-widest uppercase">
+            <span className="text-gray-500">Latest observation: {data.observation_date}</span>
             <span className="hidden md:inline text-gray-300">|</span>
-            <span className="uppercase">{data.source_type} • {data.source_name}</span>
+            <span>{data.source_type} • {data.source_name}</span>
             {historyIsCurated && (
                <>
                  <span className="hidden md:inline text-gray-300">|</span>
-                 <span className="uppercase">Trend: Curated historical data</span>
+                 <span>Trend: Curated historical data</span>
                </>
             )}
           </div>
[diff_block_end]

Please note that the above snippet only shows the MODIFIED lines from the last change. It shows up to 3 lines of unchanged lines before and after the modified lines. The actual file contents may have many more lines not shown.