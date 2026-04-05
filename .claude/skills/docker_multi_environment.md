# Docker & Docker Compose — Multi-Environment Guide

> **Audience:** AI agents and developers.
> This document explains how we use Docker Compose to run the same application
> across different environments (development, production, edge devices) without
> duplicating configuration.

---

## 1. The Core Problem

A single application often needs to run on very different targets:

- A **developer laptop** (x86, no GPU, wants to see files on host)
- A **production server** (x86, data must persist safely)
- An **edge device with GPU** (ARM64, CUDA, totally different base image)
- A **low-power edge device** (ARM64, limited RAM/storage, no GPU)

Each target may need different base images, different system packages,
different resource limits, and different runtime parameters — but the
application code is the same. We solve this with two mechanisms:

1. **Compose file overrides** — for runtime configuration (env vars, volumes, networking)
2. **Multiple Dockerfiles** — for build-time differences (base image, system deps, GPU support)

---

## 2. Compose File Overrides (Base + Override Pattern)

Docker Compose can merge multiple YAML files with `-f` flags. We use this to
keep a single **base** compose file and layer environment-specific
**override** files on top:

```
compose.yaml            ← base: all services, default config
compose.dev.yaml        ← override: development tweaks
compose.prod.yaml       ← override: production tweaks
compose.<device>.yaml   ← override: specific edge device tweaks
```

### How to launch

```bash
# Development
docker compose -f compose.yaml -f compose.dev.yaml up -d --build

# Production (base file alone is usually enough)
docker compose up -d --build

# Specific edge device
docker compose -f compose.yaml -f compose.<device>.yaml up -d --build
```

### What goes where

| File                                        | Contains                                                                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Base** (`compose.yaml`)           | All service definitions, default env vars, named volumes, networks, ports,`depends_on`                                                 |
| **Override** (`compose.<env>.yaml`) | Only the keys that differ — changed env vars, different Dockerfile path, bind mounts instead of named volumes,`runtime: nvidia`, etc. |

### How merging works

Docker Compose **deep-merges** the YAML trees. Later files win:

- **Scalars** (strings, numbers): replaced.
- **Maps** (`build:`, `environment:` as map): merged key-by-key. You only
  need to specify the keys you want to change.
- **Lists** (`environment:` as list, `volumes:` as list): **replaced
  entirely**, not appended. This is a common gotcha.

> **Recommendation:** Use the **map syntax** for `environment` so that
> overrides merge cleanly:
>
> ```yaml
> # Map syntax — override files only need to specify changed keys
> environment:
>   SAMPLING_RATE: "0.001"
>   LOG_LEVEL: "debug"
>
> # List syntax — override files must repeat ALL variables
> environment:
>   - SAMPLING_RATE=0.001
>   - LOG_LEVEL=debug
> ```

### What an override file looks like

An override file is minimal. It only contains the service name and the keys
that differ:

```yaml
# compose.dev.yaml — development overrides
services:
  my_worker:
    environment:
      SAMPLING_RATE: "0.01"        # higher for faster feedback
      LOG_CLEANUP_INTERVAL: "60"   # aggressive cleanup
    volumes:
      - ./local_data:/volume/data  # bind mount for easy inspection
```

Everything else (image, ports, networks, `depends_on`) is inherited from the
base file automatically.

---

## 3. Multiple Dockerfiles (Build-Time Differences)

Sometimes the differences between environments go deeper than configuration.
Different targets may need:

- A **completely different base image** (e.g., `python:3.x-slim` vs.
  `dustynv/l4t-pytorch` for NVIDIA Jetson)
- **Different system packages** (CPU-only PyTorch vs. GPU-enabled PyTorch
  pre-installed in the base image)
- **Different dependency files** (`requirements.txt` vs.
  `requirements.device.txt` to avoid conflicts with pre-installed packages)
- **Different build constraints** (e.g., never run `apt-get upgrade` on L4T
  images because it breaks CUDA libraries)

In these cases, we use **separate Dockerfiles**:

```
my_service/
├── Dockerfile           ← standard x86 build
├── Dockerfile.jetson    ← NVIDIA Jetson (ARM64 + CUDA)
├── requirements.txt
└── requirements.jetson.txt
```

The override compose file points to the alternative Dockerfile:

```yaml
# compose.jetson.yaml
services:
  my_worker:
    build:
      context: .
      dockerfile: ./my_service/Dockerfile.jetson
    runtime: nvidia   # expose GPU to the container
```

### When do you need a separate Dockerfile?

| Situation                                                  | Same Dockerfile?            |
| ---------------------------------------------------------- | --------------------------- |
| Only env vars or volumes differ                            | Yes — use compose override |
| Same base image, different packages                        | Maybe — use build args     |
| Completely different base image (e.g., GPU vs CPU)         | No — separate Dockerfile   |
| Different CPU architecture requiring different binary deps | No — separate Dockerfile   |

### Layer caching best practices

Regardless of which Dockerfile you use, always structure layers for cache
efficiency:

```dockerfile
# 1. Install system deps (changes rarely)
RUN apt-get update && apt-get install -y ...

# 2. Copy dependency file and install (changes occasionally)
COPY requirements.txt .
RUN pip install -r requirements.txt

# 3. Pre-download large artifacts like model weights (changes rarely)
#    This avoids slow downloads on every container start.
RUN python -c "import torchvision; torchvision.models.resnet50(weights=...)"

# 4. Copy application code (changes frequently)
COPY ./my_service /home/my_service
```

---

## 4. Volume Management

### Named volumes (production / edge)

```yaml
volumes:
  app_data:
    name: myapp_data
```

- Managed by Docker, stored in `/var/lib/docker/volumes/`
- Persist across `docker compose down` (but **not** `docker compose down -v`)
- Good for production: no dependency on host directory structure

### Bind mounts (development)

```yaml
volumes:
  - ./local_data:/volume/data
```

- Maps a host directory directly into the container
- Changes on host are instantly visible in the container and vice versa
- Good for development: inspect files, debug, iterate quickly

### The override pattern for volumes

Base file defines named volumes. Dev override replaces them with bind mounts:

```yaml
# compose.yaml (base)
services:
  my_worker:
    volumes:
      - app_data:/volume/data
volumes:
  app_data:
    name: myapp_data

# compose.dev.yaml (override)
services:
  my_worker:
    volumes:
      - ./local_data:/volume/data
```

### Shared volumes between services

When multiple services need access to the same files, they mount the same
volume. Inside each container, the path is identical (e.g., `/volume/data`),
so application code doesn't need to know which service wrote the file.

> **Important:** Docker volumes have no built-in file locking. If multiple
> containers write to the same directory, your application must handle
> coordination (e.g., write to separate subdirectories, or use one service as
> the single writer).

---

## 5. Environment Variables as Configuration

All runtime configuration is injected through environment variables in the
compose file. No config files are baked into images.

### Why environment variables?

- Easy to override per environment (just change the compose override file)
- Visible in `docker inspect` and `docker compose config`
- Follow the [12-factor app](https://12factor.net/config) convention
- No need to rebuild images when configuration changes

### Common variable categories

| Category                       | Examples                                                  | Typical override reason                               |
| ------------------------------ | --------------------------------------------------------- | ----------------------------------------------------- |
| **Resource limits**      | `MAX_LOG_COUNT`, `MAX_STORAGE_MB`                     | Edge devices have less storage                        |
| **Sampling / verbosity** | `SAMPLING_RATE`, `LOG_LEVEL`, `MAX_FRAME_DIMENSION` | Dev wants more data; edge wants less                  |
| **Network addresses**    | `SERVER_HOST`, `MASQUERADE_ADDRESS`                   | Different IP per deployment site                      |
| **Feature toggles**      | `ENABLE_HEARTBEAT`, `IS_RELOADING`                    | Some features only make sense in certain environments |
| **Paths**                | `HOME_FOLDER`, `DATA_DIR`                             | Usually stay the same but can be overridden           |

### Conditional features via optional env vars

To make a feature optional without code changes, treat an unset variable as
"disabled":

```python
heartbeat_ip = os.environ.get("PLC_HEARTBEAT_IP")  # None if not set
if heartbeat_ip:
    start_heartbeat(heartbeat_ip, ...)
```

In the compose file, simply comment out or omit the variable to disable:

```yaml
environment:
  # PLC_HEARTBEAT_IP: "192.168.0.1"   ← commented = feature disabled
```

---

## 6. Networking

### User-defined bridge network

Create a shared bridge network so services can reach each other by **service
name** (Docker's built-in DNS):

```yaml
networks:
  app_net:
    driver: bridge

services:
  backend:
    networks: [app_net]
  worker:
    networks: [app_net]
    # worker can reach backend at http://backend:8000
```

### Host network (special cases)

Some services need raw access to the host's network interfaces — e.g., for
device discovery protocols that rely on broadcast/multicast packets. Use
`network_mode: host` for these:

```yaml
services:
  device_manager:
    network_mode: host   # no network isolation, sees all host interfaces
```

> **Trade-off:** Host network breaks port isolation and DNS-based service
> discovery. Only use it when you genuinely need it.

---

## 7. Common Commands

```bash
# Start everything
docker compose -f compose.yaml -f compose.<env>.yaml up -d --build

# Rebuild and restart only one service
docker compose -f compose.yaml -f compose.<env>.yaml up -d --build <service>

# View merged config (useful for debugging overrides)
docker compose -f compose.yaml -f compose.<env>.yaml config

# Logs
docker compose logs -f <service>

# Shell into a running container
docker exec -it <container_name> bash

# Stop everything, keep volumes
docker compose down

# Stop everything, DELETE volumes (⚠ data loss)
docker compose down -v

# Clean up dangling images
docker image prune -f
```

---

## 8. Summary

| Concern                                        | Mechanism                                      |
| ---------------------------------------------- | ---------------------------------------------- |
| Different runtime config per environment       | Compose override files (`-f`)                |
| Different base image or system deps per device | Separate Dockerfiles, pointed to from override |
| Persistent data in production                  | Named volumes                                  |
| Accessible data in development                 | Bind mounts (override replaces named volumes)  |
| Service-to-service communication               | User-defined bridge network + DNS              |
| Optional features                              | Env var presence/absence                       |
| Large artifact downloads (model weights, etc.) | Pre-download in Dockerfile as cached layer     |
