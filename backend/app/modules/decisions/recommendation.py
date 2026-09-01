from typing import List, Tuple, Any, Optional
from .schemas import OpportunityDetail, Alternative, Resolution

def generate_recommendation(
    market_signals: Any,
    opportunities: List[Tuple[Any, OpportunityDetail, float, str]], # (demand, detail, net_real, feasibility)
) -> Tuple[str, str, List[str], Optional[OpportunityDetail], List[Alternative], Optional[Resolution]]:
    
    # Sort opportunities by feasibility (FEASIBLE > AT_RISK > INFEASIBLE) and then by net_realization
    def sort_key(item):
        feasibility_score = 2 if item[3] == 'FEASIBLE' else (1 if item[3] == 'AT_RISK' else 0)
        return (feasibility_score, item[2] or 0)
        
    sorted_opps = sorted(opportunities, key=sort_key, reverse=True)
    
    if not sorted_opps:
        return (
            "NO_ACTIONABLE_OPTION",
            "Low",
            ["No matching opportunities found for this lot."],
            None,
            [],
            None
        )
        
    best_opp_tuple = sorted_opps[0]
    best_demand, best_detail, best_net, best_feasibility = best_opp_tuple
    
    alternatives = []
    for (demand, detail, net, feasibility) in sorted_opps[1:]:
        reason = f"Lower net realization by ₹{best_net - net if best_net and net else 'unknown'}"
        if feasibility != 'FEASIBLE':
            reason = f"Constraint violated: {feasibility}"
            
        alternatives.append(Alternative(
            title=detail.buyer_name,
            value=detail.price,
            unit=detail.quantity_unit,
            reason_rejected=reason
        ))
        
    resolution = None
    if best_feasibility == "INFEASIBLE":
        recommendation = "NO_ACTIONABLE_OPTION"
        confidence = "High"
        reasons = ["Top opportunity does not meet your constraints."]
        resolution = Resolution(
            problem="Infeasible constraints",
            reason="Buyer requirements do not match lot properties.",
            actionable_advice="Consider adjusting your constraints or finding other buyers.",
            next_step="Review matching criteria"
        )
        best_detail = None
    elif best_feasibility == "AT_RISK":
        recommendation = "WAIT"
        confidence = "Medium"
        reasons = ["Best opportunity is at risk due to constraints (e.g. payment timing)."]
        resolution = Resolution(
            problem="Constraints AT RISK",
            reason="Payment terms or other constraints slightly misaligned.",
            actionable_advice="Negotiate with the buyer or wait for better offers.",
            next_step="Contact buyer"
        )
    else: # FEASIBLE
        # Check market signals to decide SELL_NOW or WAIT
        pressure = market_signals.pressure
        if pressure == "HIGH" or market_signals.selling_window == "FAVORABLE":
            recommendation = "SELL_NOW"
            confidence = "High"
            reasons = ["Market conditions are supportive", "Found a feasible buyer opportunity"]
        elif pressure == "LOW" and market_signals.selling_window == "CAUTION":
            recommendation = "WAIT"
            confidence = "Medium"
            reasons = ["Prices are trending down", "May want to wait if storage allows"]
        else:
            recommendation = "SELL_NOW"
            confidence = "Medium"
            reasons = ["Viable opportunity exists"]
            
    return recommendation, confidence, reasons, best_detail, alternatives[:3], resolution
