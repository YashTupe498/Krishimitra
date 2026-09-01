from typing import Dict, Any, Tuple, List
from .schemas import ConstraintEvaluation

def _normalize_payment(term: str) -> int:
    """Extract rough number of days from payment term string for basic comparison."""
    if not term:
        return 0
    term = str(term).lower()
    import re
    nums = re.findall(r'\d+', term)
    if nums:
        return int(nums[0])
    if 'immediate' in term or 'advance' in term:
        return 0
    return 30 # default safe assumption

def evaluate_feasibility(lot: Any, demand: Any, opportunity: Any) -> Tuple[str, List[ConstraintEvaluation]]:
    constraints: List[ConstraintEvaluation] = []
    overall_status = "FEASIBLE"
    
    # Quantity check
    # Assume opportunity already matched them, but let's re-verify
    # We will assume quantity is FEASIBLE if opportunity exists, but let's add it anyway.
    req_qty = float(demand.required_quantity) if demand.required_quantity else 0
    lot_qty = float(str(lot.quantity).replace(',', '')) if lot.quantity else 0
    qty_status = "FEASIBLE" if lot_qty >= req_qty else "INFEASIBLE"
    if qty_status == "INFEASIBLE": overall_status = "INFEASIBLE"
    
    constraints.append(ConstraintEvaluation(
        type="Quantity",
        farmer_requirement=f"Available: {lot_qty}",
        buyer_offering=f"Required: {req_qty}",
        status=qty_status
    ))

    # Payment constraint
    lot_payment_req = lot.constraints.get("paymentRequirement", "Any") if isinstance(lot.constraints, dict) else "Any"
    demand_payment = demand.payment_terms or "Not specified"
    
    farmer_days = _normalize_payment(lot_payment_req)
    buyer_days = _normalize_payment(demand_payment)
    
    if buyer_days > farmer_days and farmer_days > 0:
        pay_status = "AT_RISK"
        if overall_status != "INFEASIBLE": overall_status = "AT_RISK"
    else:
        pay_status = "FEASIBLE"
        
    constraints.append(ConstraintEvaluation(
        type="Payment",
        farmer_requirement=lot_payment_req,
        buyer_offering=demand_payment,
        status=pay_status
    ))

    # Transport constraint
    lot_transport_req = lot.constraints.get("transportCapability", "Can arrange") if isinstance(lot.constraints, dict) else "Not specified"
    demand_transport = demand.transport_requirement or "Not specified"
    
    constraints.append(ConstraintEvaluation(
        type="Transport",
        farmer_requirement=lot_transport_req,
        buyer_offering=demand_transport,
        status="FEASIBLE" # Simple pass-through for now
    ))
    
    return overall_status, constraints
