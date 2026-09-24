#ifndef AXIL_HYLE_H
#define AXIL_HYLE_H

/**
 * @file axil-hyle.h
 * @brief Generic Axil-Hyle HTTP bridge.
 *
 * Mounts standard REST CRUD endpoints (\c /api/dataset/...) for any Axil
 * web application. Framework-neutral: serves JSON only, with pluggable
 * partition routes for parent/child datasets.
 */

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Mount the standard Axil-Hyle REST CRUD routes (\c /api/dataset/...).
 */
void axil_hyle_install_routes(void);

/**
 * @brief Context describing one requested partition change.
 */
typedef struct {
	/** Action slug: "add", "remove", "replace", "update". */
	const char *action;
	/** Entity module name, e.g. "gig", "grp". */
	const char *module;
	/** Parent item key. */
	const char *parent_id;
	/** Partition source id, e.g. "gig.songs", "grp.songs". */
	const char *partition_id;
	/** 0-based row index in partition, or -1. */
	int row_index;
	/** Child item key. */
	const char *item_key;
	/** Client fd. */
	int fd;
	/** Caller data. */
	void *user_data;
} axil_hyle_partition_change_ctx_t;

/**
 * @brief Callback invoked after a partition change executes.
 * @param[in] ctx Change context.
 * @return 0 on success, non-zero to signal failure.
 */
typedef int (*axil_hyle_partition_change_fn)(const axil_hyle_partition_change_ctx_t *ctx);

/**
 * @brief One parameter-name alias for a schema field.
 */
typedef struct {
	/** Schema field name, e.g. "transpose". */
	const char *field;
	/** Alternate parameter names, e.g. {"key", "t", NULL}. */
	const char *aliases[4];
} axil_hyle_param_alias_t;

/**
 * @brief Pluggable authorization callback for a request.
 * @param[in] fd        Client fd.
 * @param[in] module    Entity module name.
 * @param[in] parent_id Parent item key.
 * @param[in] username  Authenticated username.
 * @param[in] user_data Caller data.
 * @return Non-zero to allow, zero to deny.
 */
typedef int (*axil_hyle_access_check_fn)(
	int fd, const char *module, const char *parent_id,
	const char *username, void *user_data);

/**
 * @brief Declarative specification for partition sub-resource routes.
 */
typedef struct {
	/** Entity module name, e.g. "gig", "grp". */
	const char *module;
	/** Route slug for a single child, e.g. "song". */
	const char *child_resource;
	/** Route slug for the collection, e.g. "songs"
	 *  (optional, defaults to child_resource + "s"). */
	const char *children_resource;
	/** Partition dataset id, e.g. "gig.songs", "grp.songs". */
	const char *partition_source;
	/** Child identifier field in schema, e.g. "song". */
	const char *primary_field;
	/** Field to set to "1" on manual add/update, or NULL. */
	const char *pin_field;
	/** 1 if routes use :n (e.g. gig), 0 if routes use :child_id (e.g. grp). */
	int positional;
	/** Action slug for the key-based update route,
	 *  e.g. "key" or "update" (default "key"). */
	const char *update_action;
	/**
	 * Optional redirect pattern for form submissions, e.g. "/%s/%s"
	 * (formats with module, parent_id) or "/gig/%s" (formats with
	 * parent_id). If NULL, responds with JSON {"ok":true,"index":...}.
	 */
	const char *redirect_pattern;
	/** NULL-terminated or field-matching alias table. */
	const axil_hyle_param_alias_t *aliases;
	/** Optional pluggable authorization callback. */
	axil_hyle_access_check_fn check_access;
	/** Optional partition-change callback. */
	axil_hyle_partition_change_fn on_change;
	/** Caller data passed to the callbacks. */
	void *user_data;
} axil_hyle_partition_routes_spec_t;

/*
 * Layer 1: Execution engine - executes a partition sub-resource action against
 * a Hyle ordered dataset without registering HTTP routes.
 */
/**
 * @brief Execute a partition sub-resource action (no route registration).
 * @param[in] fd        Client fd.
 * @param[in] body      Request body.
 * @param[in] action    Action slug ("add", "remove", "replace", "update").
 * @param[in] spec      Partition routes specification.
 * @param[in] parent_id Parent item key.
 * @return 0 on success, negative on failure.
 */
int axil_hyle_partition_execute(
	int fd, char *body,
	const char *action,
	const axil_hyle_partition_routes_spec_t *spec,
	const char *parent_id);

/*
 * Layer 2: Declarative route mounter - mounts standard sub-resource routes
 * in Axil using axil_hyle_partition_execute.
 */
/**
 * @brief Mount standard sub-resource routes for a partition spec.
 * @param[in] spec Partition routes specification.
 * @return 0 on success, negative on failure.
 */
int axil_hyle_register_partition_routes(const axil_hyle_partition_routes_spec_t *spec);

#ifdef __cplusplus
}
#endif

#endif /* AXIL_HYLE_H */
