from typing import Dict, Any, Tuple

def calculate_net_realization(quantity_kg: float, price_per_quintal: float, distance_km: float = 0) -> Tuple[float, float, float, float, float]:
    """
    Calculates the economics.
    Returns: (gross_value, transport_cost, handling_cost, storage_cost, net_realization)
    """
    quantity_quintals = quantity_kg / 100.0
    gross_value = quantity_quintals * price_per_quintal
    
    # We shouldn't invent costs. If distance is 0, we assume transport is unavailable to calculate
    # But for a realistic prototype, let's use a standard rate if location is known, else None
    # For now, let's use a very basic logic:
    # transport: 15 rs per km per quintal (if distance > 0)
    transport_cost = (15.0 * distance_km * quantity_quintals) if distance_km > 0 else None
    
    # Handling: 2% of gross value
    handling_cost = gross_value * 0.02
    
    storage_cost = None # Unavailable
    
    total_deductions = handling_cost
    if transport_cost is not None:
        total_deductions += transport_cost
        
    net_realization = gross_value - total_deductions
    
    return gross_value, transport_cost, handling_cost, storage_cost, net_realization
