## Views Overview

This section provides an overview of the views in the application, highlighting whether they use static files or models, and explaining their purpose.

| **View**              | **Static Files** | **Models**                      | **Purpose**                                                                                                                                                      |
|-----------------------|------------------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`NetworkData`**     | ✅               | ✅ (`CharacterComponent`, `GuestComponent`) | Fetches precomputed network component data from static JSON files and maps it to components stored in the database for additional metadata.                     |
| **`ComponentsSummary`** | ✅               | ✅ (`CharacterComponent`, `GuestComponent`) | Reads static JSON files to provide summary statistics about network components and combines this with metadata stored in the database.                           |
| **`CharacterDetailView`** | ❌              | ✅ (`Character`, `Actor`, `Episode`)       | Retrieves detailed information about a character, including related actors, episodes, and the character's component data, all stored in the database.           |
| **`GuestDetailView`** | ❌               | ✅ (`Guest`, `Character`, `Episode`)       | Provides detailed information about a guest, including their appearances in episodes and interactions with characters, all from the database.                   |
| **`EpisodeDetailView`** | ❌              | ✅ (`Episode`, `Character`, `Guest`)       | Fetches details about all episodes, including associated characters and guests, from the database.                                                              |
| **`ShortestPathView`** | ❌              | ✅ (`Character`, `Guest`, `ShortestPath`)  | Computes the shortest path between two nodes in a network (either characters or guests), based on precomputed paths stored in the database.                     |

---

### Static Files and Models Usage

1. **Static Files**:
   - Static JSON files (`{entity_type}_components_updated.json`) are used in `NetworkData` and `ComponentsSummary` views to store precomputed network data. These files provide component-specific details such as nodes and edges.
   - These static files reduce database query complexity and improve performance for operations that do not require frequent updates.

2. **Database Models**:
   - The database models (`CharacterComponent`, `GuestComponent`, `Character`, `Guest`, `Episode`, `ShortestPath`) provide dynamic metadata or relationships that are not stored in static files.
   - For example, `NetworkData` uses models to map static file data to specific components in the database, ensuring consistency and detailed metadata.

### Design Rationale
Combining static files with database models is intended to balance performance with flexibility:
- Static files allow for faster access to large datasets that change infrequently.
- Database models ensure dynamic relationships and metadata are up-to-date.
