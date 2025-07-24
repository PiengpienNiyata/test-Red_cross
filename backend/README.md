## Docker Compose Setup

### Prerequisites

1. **Create Docker Network**

   ```sh
   docker network create --driver bridge --subnet 172.80.0.0/16 researcher_form_network
   ```

2. **Configure PostgreSQL**

   Edit the following files:

   - `/etc/postgresql/16/main/postgresql.conf`

     ```conf
     listen_addresses = '*'
     ```

   - `/etc/postgresql/16/main/pg_hba.conf`
     ```conf
     # docker
     host    all             all             172.80.0.0/16           md5
     ```
