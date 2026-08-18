# Specification: Strict Tool Calling & SMAE Synonym Search

## Domain
SMAE Tool Execution & Food Catalog Normalization

## Requirements

### Requirement: Synonym Normalization
The system MUST expand colloquial Mexican food names before querying Neon Postgres:
- `"jitomate rojo"` $\rightarrow$ `"jitomate"`
- `"jitomate saladet"` $\rightarrow$ `"jitomate guaje o saladet"`
- `"pechuga"` $\rightarrow$ `"pechuga de pollo"`
- `"huevo"` $\rightarrow$ `"huevo fresco"`
- `"arroz"` $\rightarrow$ `"arroz cocido"`

### Requirement: Accurate Net Grams
`getGramsForPortion` MUST return the exact SMAE Net Weight (e.g. 113g for Jitomate, 106g for Manzana).
