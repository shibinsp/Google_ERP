import { InventoryItem, StockMovement, StockForecast, ForecastTimelinePoint } from '../types';

export type ForecastModelType = 'exponential' | 'linear' | 'surge';

export interface ForecastOptions {
  modelType?: ForecastModelType;
  surgeFactor?: number; // e.g., 1.30 for +30% demand shock
  leadTimeBufferDays?: number; // optional adjustment to lead time
}

// Fixed baseline anchor date representing the current operational date
const BASE_DATE_ISO = '2026-09-18';

function addDaysToDate(baseDateStr: string, days: number): string {
  const date = new Date(baseDateStr + 'T00:00:00');
  date.setDate(date.getDate() + Math.round(days));
  return date.toISOString().slice(0, 10);
}

function getCategoryDefaultLeadTime(category: InventoryItem['category']): number {
  switch (category) {
    case 'Components':
      return 7;
    case 'Electronics':
      return 6;
    case 'Raw Materials':
      return 10;
    case 'Packaging':
      return 4;
    case 'Finished Goods':
      return 12;
    default:
      return 7;
  }
}

/**
 * Calculates predictive stock forecasting for each inventory item based on
 * historical movements, daily demand velocity, supplier lead time, and turnover characteristics.
 */
export function calculateStockForecasts(
  inventory: InventoryItem[],
  movements: StockMovement[],
  options: ForecastOptions = {}
): StockForecast[] {
  const modelType = options.modelType || 'exponential';
  const surgeFactor = options.surgeFactor || 1.0;
  const leadTimeBuffer = options.leadTimeBufferDays || 0;

  return inventory.map((item) => {
    // 1. Gather historical outbound movements
    const itemMovements = movements.filter(
      (m) => m.itemId === item.id || m.sku === item.sku
    );

    const outboundMovements = itemMovements.filter(
      (m) => m.type === 'outbound_dispatch' || (m.type === 'audit_adjustment' && m.quantity < 0)
    );

    const totalHistoricalDispatched = outboundMovements.reduce(
      (acc, m) => acc + Math.abs(m.quantity),
      0
    );

    // 2. Calculate baseline daily consumption from turnover & DSI
    // DSI = (currentStock / dailyConsumption), so baseline daily demand ~ currentStock / DSI
    const dsiDailyRate =
      item.daysSalesOfInventory > 0
        ? Math.max(0.4, Number((item.currentStock / item.daysSalesOfInventory).toFixed(2)))
        : 1.5;

    // Movement-based velocity: average over the 30-day window
    let movementDailyRate = dsiDailyRate;
    if (outboundMovements.length > 0) {
      // Split into recent (last 7 days) vs earlier (8-30 days) to detect trend acceleration
      let recentUnits = 0;
      let earlierUnits = 0;
      const baseTime = new Date(BASE_DATE_ISO + 'T23:59:59').getTime();

      outboundMovements.forEach((m) => {
        const mTime = new Date(m.timestamp.replace(' ', 'T')).getTime();
        const diffDays = Math.max(0, (baseTime - mTime) / (1000 * 60 * 60 * 24));
        const qty = Math.abs(m.quantity);
        if (diffDays <= 7) {
          recentUnits += qty;
        } else {
          earlierUnits += qty;
        }
      });

      const recentDaily = recentUnits / 7;
      const earlierDaily = earlierUnits / 23;

      if (modelType === 'exponential') {
        // Exponential moving average: 70% weight on recent velocity, 30% on historical
        movementDailyRate = recentDaily * 0.7 + earlierDaily * 0.3;
      } else if (modelType === 'linear') {
        // Simple linear moving average
        movementDailyRate = (recentUnits + earlierUnits) / 30;
      } else {
        // Surge simulation
        movementDailyRate = (recentDaily * 0.6 + earlierDaily * 0.4) * surgeFactor;
      }
    }

    // Blend movement velocity with turnover baseline to ensure robust predictions
    let calculatedVelocity = Math.max(
      0.5,
      Number(((movementDailyRate * 0.75 + dsiDailyRate * 0.25) * surgeFactor).toFixed(2))
    );

    // 3. Trend analysis (accelerating, stable, decelerating)
    const recentUnitsLast7 = outboundMovements
      .filter((m) => {
        const mTime = new Date(m.timestamp.replace(' ', 'T')).getTime();
        const baseTime = new Date(BASE_DATE_ISO + 'T23:59:59').getTime();
        return (baseTime - mTime) / (1000 * 60 * 60 * 24) <= 7;
      })
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

    const prevUnitsPrev7 = outboundMovements
      .filter((m) => {
        const mTime = new Date(m.timestamp.replace(' ', 'T')).getTime();
        const baseTime = new Date(BASE_DATE_ISO + 'T23:59:59').getTime();
        const diff = (baseTime - mTime) / (1000 * 60 * 60 * 24);
        return diff > 7 && diff <= 14;
      })
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

    let velocityChangePercent = 0;
    if (prevUnitsPrev7 > 0) {
      velocityChangePercent = Math.round(((recentUnitsLast7 - prevUnitsPrev7) / prevUnitsPrev7) * 100);
    }

    let demandVelocityTrend: 'accelerating' | 'stable' | 'decelerating' = 'stable';
    if (velocityChangePercent >= 12) {
      demandVelocityTrend = 'accelerating';
    } else if (velocityChangePercent <= -12) {
      demandVelocityTrend = 'decelerating';
    }

    // 4. Supplier Lead Time
    const leadTimeDays = getCategoryDefaultLeadTime(item.category) + leadTimeBuffer;

    // 5. Days until Reorder Point & Stockout
    const unitsAboveReorder = Math.max(0, item.currentStock - item.reorderPoint);
    let daysUntilReorderPoint = 0;
    if (item.currentStock > item.reorderPoint) {
      daysUntilReorderPoint = Math.max(1, Math.round(unitsAboveReorder / calculatedVelocity));
    }

    // Suggested Reorder Date
    let suggestedReorderDate: string;
    if (item.currentStock <= item.reorderPoint) {
      suggestedReorderDate = BASE_DATE_ISO; // Immediate
    } else {
      suggestedReorderDate = addDaysToDate(BASE_DATE_ISO, daysUntilReorderPoint);
    }

    // Days until Stockout / Depletion (0 units remaining)
    const daysUntilStockout = item.currentStock <= 0 ? 0 : Math.max(0, Math.round(item.currentStock / calculatedVelocity));
    const projectedStockoutDate = addDaysToDate(BASE_DATE_ISO, daysUntilStockout);
    const daysUntilDepletion = daysUntilStockout;
    const projectedDepletionDate = projectedStockoutDate;

    // Depletion urgency classification
    let depletionRiskLevel: 'critical_depleted' | 'urgent_7d' | 'moderate_14d' | 'healthy_15d_plus';
    if (item.currentStock <= 0 || daysUntilDepletion === 0) {
      depletionRiskLevel = 'critical_depleted';
    } else if (daysUntilDepletion <= 7) {
      depletionRiskLevel = 'urgent_7d';
    } else if (daysUntilDepletion <= 14) {
      depletionRiskLevel = 'moderate_14d';
    } else {
      depletionRiskLevel = 'healthy_15d_plus';
    }

    // 6. Recommended Reorder Quantity (EOQ / Target capacity balance)
    const targetCapacityDeficit = item.maxCapacity - item.currentStock;
    const leadTimeUsage = Math.round(calculatedVelocity * leadTimeDays * 1.5);
    const recommendedReorderQuantity = Math.max(
      30,
      Math.min(
        item.maxCapacity - item.safetyStock,
        Math.ceil(Math.max(targetCapacityDeficit, leadTimeUsage) / 10) * 10
      )
    );

    // 7. Urgency Classification
    let urgency: 'critical_immediate' | 'reorder_soon' | 'optimal';
    if (item.currentStock <= item.safetyStock || item.currentStock <= item.reorderPoint) {
      urgency = 'critical_immediate';
    } else if (daysUntilReorderPoint <= leadTimeDays + 2) {
      urgency = 'reorder_soon';
    } else {
      urgency = 'optimal';
    }

    // 8. Model Confidence Score (based on data completeness & movement variance)
    const movementBonus = Math.min(15, itemMovements.length * 3);
    const modelConfidence = Math.min(98, 80 + movementBonus);

    // 9. Generate 30-day projection timeline for chart visualizer
    // Day -7 to Day 0 (historical reconstruction) + Day 1 to Day 21 (future projection)
    const projectionTimeline: ForecastTimelinePoint[] = [];

    // Historical Points (Day -6 to Day 0)
    for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
      const pointDate = addDaysToDate(BASE_DATE_ISO, dayOffset);
      // Reconstruct approximate historical stock level
      const estimatedHistoricalStock = Math.round(
        item.currentStock + Math.abs(dayOffset) * calculatedVelocity * 0.9
      );

      projectionTimeline.push({
        day: dayOffset,
        date: pointDate.slice(5), // "09-12"
        historicalActualStock: estimatedHistoricalStock,
        projectedStock: estimatedHistoricalStock,
        upperConfidenceBound: Math.round(estimatedHistoricalStock * 1.05),
        lowerConfidenceBound: Math.round(estimatedHistoricalStock * 0.95),
        reorderThreshold: item.reorderPoint,
        safetyThreshold: item.safetyStock,
        isProjected: false,
      });
    }

    // Future Projected Points (Day 1 to Day 24)
    for (let dayOffset = 1; dayOffset <= 24; dayOffset++) {
      const pointDate = addDaysToDate(BASE_DATE_ISO, dayOffset);
      const projectedStock = Math.max(
        0,
        Math.round(item.currentStock - dayOffset * calculatedVelocity)
      );

      const varianceFactor = 0.04 + dayOffset * 0.008; // Confidence interval widens into future
      const upper = Math.round(projectedStock * (1 + varianceFactor));
      const lower = Math.max(0, Math.round(projectedStock * (1 - varianceFactor)));

      projectionTimeline.push({
        day: dayOffset,
        date: pointDate.slice(5), // "09-22"
        projectedStock,
        upperConfidenceBound: upper,
        lowerConfidenceBound: lower,
        reorderThreshold: item.reorderPoint,
        safetyThreshold: item.safetyStock,
        isProjected: true,
      });
    }

    return {
      itemId: item.id,
      sku: item.sku,
      itemName: item.name,
      category: item.category,
      currentStock: item.currentStock,
      safetyStock: item.safetyStock,
      reorderPoint: item.reorderPoint,
      maxCapacity: item.maxCapacity,
      unitCost: item.unitCost,
      supplier: item.supplier,
      warehouseLocation: item.warehouseLocation,
      averageDailyDemand: calculatedVelocity,
      demandVelocityTrend,
      velocityChangePercent,
      leadTimeDays,
      daysUntilReorderPoint,
      suggestedReorderDate,
      daysUntilStockout,
      projectedStockoutDate,
      projectedDepletionDate,
      daysUntilDepletion,
      historicalOutboundBurnRate: calculatedVelocity,
      outboundMovementCount: outboundMovements.length,
      depletionRiskLevel,
      recommendedReorderQuantity,
      urgency,
      modelConfidence,
      historicalMovementsCount: itemMovements.length,
      totalHistoricalDispatched,
      projectionTimeline,
    };
  });
}
