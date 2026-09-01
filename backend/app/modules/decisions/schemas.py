from pydantic import BaseModel, UUID4
from typing import Optional, List, Dict, Any
from datetime import datetime

class Evidence(BaseModel):
    source: str
    observed_at: Optional[datetime] = None
    reliability: str

class Alternative(BaseModel):
    title: str
    value: float
    unit: str
    reason_rejected: str

class Resolution(BaseModel):
    problem: str
    reason: str
    actionable_advice: str
    next_step: str

class ConstraintEvaluation(BaseModel):
    type: str  # e.g., 'Payment', 'Transport', 'Storage'
    farmer_requirement: str
    buyer_offering: str
    status: str  # 'FEASIBLE', 'AT_RISK', 'INFEASIBLE'

class MarketContext(BaseModel):
    modal_price: Optional[float]
    low_price: Optional[float]
    high_price: Optional[float]
    price_movement: Optional[str] # 'UP', 'DOWN', 'STABLE'
    pressure: Optional[str] # 'HIGH', 'MODERATE', 'LOW'
    selling_window: Optional[str]
    nearby_markets: List[str] = []

class OpportunityDetail(BaseModel):
    opportunity_id: UUID4
    buyer_id: UUID4
    buyer_name: str
    price: float
    quantity: float
    quantity_unit: str
    payment_terms: str
    expected_realization: Optional[float]

class DecisionSnapshot(BaseModel):
    decision_id: str
    lot_id: str
    recommendation: str
    generated_at: datetime
    inputs: Dict[str, Any]
    output: Dict[str, Any]

class DecisionResponse(BaseModel):
    id: str
    generated_at: datetime
    lot_id: str
    farmer_id: str
    
    recommendation: str # 'SELL_NOW', 'WAIT', 'CONSIDER_STORAGE', 'NO_ACTIONABLE_OPTION'
    confidence: str # 'High', 'Medium', 'Low'
    reasons: List[str]
    
    market_signals: MarketContext
    best_opportunity: Optional[OpportunityDetail]
    
    net_realization: Optional[float]
    gross_value: Optional[float]
    transport_cost: Optional[float]
    handling_cost: Optional[float]
    storage_cost: Optional[float]
    
    feasibility: str # 'FEASIBLE', 'AT_RISK', 'INFEASIBLE'
    constraints: List[ConstraintEvaluation] = []
    
    alternatives: List[Alternative] = []
    resolution_guidance: Optional[Resolution] = None
    evidence: List[Dict[str, str]] = [] # list of { factor: string, text: string, source: string }
    
    snapshot: Optional[DecisionSnapshot] = None

    class Config:
        orm_mode = True
