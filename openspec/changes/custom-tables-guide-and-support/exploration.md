# Exploration: Custom Table Support (Plans & Packaged Foods)

## Overview

There are two primary types of "custom tables" a user may want to add to the SMAE agent:
1. **Custom Meal Plans (Planes de Alimentación Personalizados)**:
   - Custom names (e.g. `"Volumen 3000"`, `"Día de Pierna"`, `"Definición"`).
   - Custom meal times (e.g. `pre_entreno`, `post_entreno`, `almuerzo`, `cena`).
   - Custom portion distributions across SMAE groups.
2. **Custom Packaged Food Nutrition Facts (Tablas Nutrimentales de Productos)**:
   - Protein powders, supplements, snack bars, cereal boxes, or packaged foods not found in the original SMAE Excel.

---

## 1. How to Add Custom Meal Plan Tables in Chat

You can name and structure your plan in any way. The agent parses:
- **Explicit Plan Name**: Start your message with the name (e.g. `Plan: VOLUMEN 3000` or `Guarda este plan: DIA DE PIERNA`).
- **Any Column Names / Meal Times**: You can use standard meals (`Desayuno`, `Comida`, `Cena`) or custom meals (`Pre-workout`, `Post-workout`, `Colación 3`).
- **Any SMAE Groups**: Any combination of standard groups.

### Example Chat Input:
```text
Guarda este plan: VOLUMEN 3000
| Grupo          | Pre-Entreno | Almuerzo | Post-Entreno | Comida | Cena | Total |
| -------------- | ----------- | -------- | ------------ | ------ | ---- | ----- |
| Verduras       | ·           | 2        | ·            | 2      | 2    | 6     |
| Frutas         | 2           | 1        | 2            | ·      | ·    | 5     |
| Cereal s/grasa | 4           | 4        | 4            | 4      | 4    | 20    |
| AOA            | 2           | 4        | 4            | 4      | 4    | 18    |
| Leche          | ·           | 1        | 1            | ·      | 1    | 3     |
| Grasa s/prot   | ·           | 2        | ·            | 2      | 2    | 6     |
| Grasa c/prot   | 1           | 1        | 1            | 1      | 1    | 5     |
```

👉 **Agent Action**: Calls `saveMealPlan` with `planName: "VOLUMEN 3000"`, creates the custom meal slots (`pre_entreno`, `post_entreno`, etc.), and persists everything in the database.

---

## 2. How to Add Custom Packaged Food Tables (`logNutritionFacts`)

If you want to add a custom food item from a commercial nutrition label:

### Example Chat Input:
```text
Registra este alimento de su tabla nutrimental:
Nombre: Proteína Whey Isolate Dymatize
Porción: 30g
Calorías: 120 kcal
Proteína: 25g
Grasa: 1g
Carbohidratos: 2g
```

👉 **Agent Action**:
1. Scales values per 100g.
2. Deconstructs into SMAE equivalents:
   - 25g Protein $\approx$ 3.5 equivalentes de AOA Muy Bajo en Grasa.
   - 1g Fat $\approx$ 0.2 equivalentes de Grasa.
   - 2g Carbs $\approx$ 0.1 equivalentes de Cereal.
3. Inserts the custom food into the `foods` table (`source: 'user'`).
4. Available immediately for all future queries (`"cuántos gramos son 2 eq de Proteína Whey Dymatize"`).

---

## Recommendation

The system **already supports both custom meal plans and custom food tables**. We ensure the agent's instructions provide clear guidance on recognizing both types seamlessly.
