from datetime import date, timedelta

def calculate_freshness(observation_date: date, reference_date: date = None) -> str:
    """
    Calculates the freshness of data based on the observation date.
    Returns: 'CURRENT', 'STALE', or 'OUTDATED'
    """
    if observation_date is None:
        return 'OUTDATED'
        
    if reference_date is None:
        reference_date = date.today()
        
    diff = (reference_date - observation_date).days
    
    if diff <= 2:
        return 'CURRENT'
    elif diff <= 7:
        return 'STALE'
    else:
        return 'OUTDATED'
