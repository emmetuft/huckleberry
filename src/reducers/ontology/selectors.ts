import { createSelector } from '@reduxjs/toolkit';
import {
  selectGraphData,
  selectLabelFilters,
  selectPropertyFilters,
} from './slice';
import { FilterOperator } from '../../../shared/models/interfaces/filters';

/**
 * Memoized selector that returns filtered graph data based on label and property filters
 */
export const selectFilteredGraphData = createSelector(
  [selectGraphData, selectLabelFilters, selectPropertyFilters],
  (graphData, selectedLabels, propertyFilters) => {
    // Start with all nodes
    let filteredNodes = graphData.nodes;

    // Apply label filters
    if (selectedLabels.length > 0) {
      filteredNodes = filteredNodes.filter((node) =>
        node.labels.some((label) => selectedLabels.includes(label)),
      );
    }

    // Apply property filters
    if (propertyFilters.length > 0) {
      filteredNodes = filteredNodes.filter((node) => {
        // Node must match ALL filters (AND logic)
        return propertyFilters.every((filter) => {
          // Check if node has the specified label
          if (!node.labels.includes(filter.nodeLabel)) {
            return false;
          }

          const propertyValue = node.properties[filter.property];
          if (propertyValue === undefined || propertyValue === null) {
            return false;
          }

          // Apply operator-specific logic
          switch (filter.operator) {
            case FilterOperator.EQUALS:
              return propertyValue === filter.value;
            case FilterOperator.NOT_EQUALS:
              return propertyValue !== filter.value;
            case FilterOperator.CONTAINS:
              return String(propertyValue)
                .toLowerCase()
                .includes(String(filter.value).toLowerCase());
            case FilterOperator.GT:
              return Number(propertyValue) > Number(filter.value);
            case FilterOperator.LT:
              return Number(propertyValue) < Number(filter.value);
            case FilterOperator.GTE:
              return Number(propertyValue) >= Number(filter.value);
            case FilterOperator.LTE:
              return Number(propertyValue) <= Number(filter.value);
            case FilterOperator.BETWEEN:
              if (filter.valueType === 'date') {
                const date = new Date(propertyValue);
                const startDate = new Date(filter.value[0]);
                const endDate = new Date(filter.value[1]);
                return date >= startDate && date <= endDate;
              } else {
                return (
                  Number(propertyValue) >= Number(filter.value[0]) &&
                  Number(propertyValue) <= Number(filter.value[1])
                );
              }
            case FilterOperator.BEFORE:
              return new Date(propertyValue) < new Date(filter.value);
            case FilterOperator.AFTER:
              return new Date(propertyValue) > new Date(filter.value);
            default:
              return true;
          }
        });
      });
    }

    // Get IDs of filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    // Filter relationships to only include those between filtered nodes
    const filteredRelationships = graphData.relationships.filter(
      (rel) =>
        filteredNodeIds.has(rel.source) && filteredNodeIds.has(rel.target),
    );

    return {
      nodes: filteredNodes,
      relationships: filteredRelationships,
    };
  },
);
