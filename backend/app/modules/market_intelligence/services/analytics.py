from typing import List, Dict, Any, Optional
from decimal import Decimal
from app.modules.market_intelligence.models import MarketObservation
from app.modules.market_intelligence.schemas import (
    MarketTrendSchema, MarketPressureSchema, SaleWindowSchema
)

def analyze_trend(observations: List[MarketObservation]) -> MarketTrendSchema:
    if len(observations) < 2:
        return MarketTrendSchema(
            direction="INSUFFICIENT_DATA",
            price_change=None,
            percentage_change=None
        )
    
    # Compare latest modal price against the average of the preceding available observations (up to 5)
    current = observations[0].modal_price
    
    historical_prices = [obs.modal_price for obs in observations[1:6] if obs.modal_price is not None and obs.modal_price > 0]
    
    if current is None or not historical_prices:
        return MarketTrendSchema(
            direction="INSUFFICIENT_DATA",
            price_change=None,
            percentage_change=None
        )
        
    baseline_avg = sum(historical_prices) / len(historical_prices)
    
    change = float(current) - float(baseline_avg)
    pct_change = (change / float(baseline_avg)) * 100
    
    if pct_change > 2.0:
        direction = "UP"
    elif pct_change < -2.0:
        direction = "DOWN"
    else:
        direction = "STABLE"
        
    return MarketTrendSchema(
        direction=direction,
        price_change=round(change, 2),
        percentage_change=round(pct_change, 2)
    )

def analyze_pressure(observations: List[MarketObservation], trend: MarketTrendSchema) -> MarketPressureSchema:
    if len(observations) < 2:
        return MarketPressureSchema(
            pressure="INSUFFICIENT_DATA",
            reasons=["Not enough historical data to determine market pressure."]
        )
        
    current_arrival = observations[0].arrival_quantity
    if current_arrival is None:
        return MarketPressureSchema(
            pressure="INSUFFICIENT_DATA",
            reasons=["Recent arrival quantity data is unavailable."]
        )
        
    # Calculate simple average of historical arrivals (excluding current)
    historical = [obs.arrival_quantity for obs in observations[1:5] if obs.arrival_quantity is not None]
    if not historical:
        return MarketPressureSchema(
            pressure="INSUFFICIENT_DATA",
            reasons=["Historical arrival data is unavailable for comparison."]
        )
        
    avg_arrival = sum(historical) / len(historical)
    current = float(current_arrival)
    avg = float(avg_arrival)
    
    reasons = []
    pressure = "MODERATE"
    
    if current > avg * 1.2:
        pressure = "HIGH"
        reasons.append("Recent arrivals are significantly higher than the recent average.")
    elif current < avg * 0.8:
        pressure = "LOW"
        reasons.append("Recent arrivals are below the recent average.")
    else:
        pressure = "MODERATE"
        reasons.append("Arrivals are steady compared to the recent average.")
        
    if trend.direction == "DOWN":
        reasons.append("Modal price has shown a downward movement, indicating lower demand or oversupply.")
        if pressure != "HIGH":
            pressure = "MODERATE" # bump pressure down
    elif trend.direction == "UP":
        reasons.append("Modal price has shown an upward movement, indicating strong demand.")
        
    return MarketPressureSchema(pressure=pressure, reasons=reasons)

def analyze_sale_window(trend: MarketTrendSchema, pressure: MarketPressureSchema) -> SaleWindowSchema:
    if trend.direction == "INSUFFICIENT_DATA" or pressure.pressure == "INSUFFICIENT_DATA":
        return SaleWindowSchema(
            window="INSUFFICIENT_DATA",
            advice="Not enough market data to evaluate the current sale window."
        )
        
    if trend.direction == "UP" and pressure.pressure in ["LOW", "MODERATE"]:
        return SaleWindowSchema(
            window="FAVORABLE_NOW",
            advice="Current market conditions appear favorable. Prices are trending up without high supply pressure."
        )
    elif trend.direction == "DOWN" and pressure.pressure == "HIGH":
        return SaleWindowSchema(
            window="CONSIDER_WAITING",
            advice="High market arrivals are pushing prices down. Consider waiting if storage is available."
        )
    else:
        return SaleWindowSchema(
            window="NEUTRAL",
            advice="Market conditions are stable. Normal selling window."
        )
