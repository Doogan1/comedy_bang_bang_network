### **Data Pipeline Overview**

The data pipeline for this project is designed to scrape, process, and transform episode data from the Comedy Bang Bang Wiki into a structured database. This pipeline also generates JSON files for network visualization. Below is a step-by-step breakdown of the pipeline:

---

#### **1. Scrape Episode Data**
- **Command**: `write_episodes`
- **Description**: Scrapes episode information from the Comedy Bang Bang Wiki, including episode titles, numbers, release dates, guests, and characters. The scraped data is saved to a CSV file (`episode-characters.csv`).
- **Output**: A CSV file containing raw episode data.

---

#### **2. Import Episode Data**
- **Command**: `import_episodes`
- **Description**: Reads the scraped CSV file and imports the data into the database. This step creates or updates episodes, characters, and guests while establishing relationships between them.
- **Output**: Populated database with episodes, characters, and guests.

---

#### **3. Clean Data**
- **Command**: `clean_data`
- **Description**: Identifies and resolves duplicate entries for characters and guests using fuzzy matching. Prompts the user for manual input to confirm merges when ambiguities arise.
- **Output**: Cleaned and validated database records.

---

#### **4. Connect Characters and Guests**
- **Command**: `connect_characters_guests`
- **Description**: Reads a `character-actor.csv` file to establish relationships between characters and their corresponding guests (e.g., actors voicing characters). Creates or retrieves database records for characters and guests as needed.
- **Output**: Established `ManyToMany` relationships between characters and guests.

---

#### **5. Fix Episode Numbers**
- **Command**: `fix_episode_numbers`
- **Description**: Standardizes episode numbers by truncating excessively long numbers to three digits if they lack a decimal point.
- **Output**: Standardized episode numbers in the database.

---

#### **6. Generate Network Data**
- **Command**: `general_generate_network_data`
- **Description**: Creates co-appearance networks for characters or guests. The generated network data includes nodes and edges for visualization purposes. Outputs are saved as JSON files in a specified directory.
- **Output**: JSON files (`characters_components.json`, `guests_components.json`) for frontend visualization.

---

#### **7. Master Script**
- **Command**: `run_all_import_create`
- **Description**: Orchestrates the entire pipeline by running all the above commands in sequence. This script ensures the database and visualization files are fully updated.
- **Output**: Fully processed database and up-to-date JSON files.

---

### **Planned Improvements**
- **Incremental Updates**: Modify the scraping step to fetch only episodes released after the last update.
- **Automated Data Cleaning**: Reduce manual intervention during the data cleaning step by automating high-confidence merges.
- **Error Handling**: Enhance error logging to ensure that partial pipeline failures do not halt the entire process.

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
