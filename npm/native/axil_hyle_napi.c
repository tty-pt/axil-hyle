#include <node_api.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include <ttypt/axil-hyle.h>

static bool extract_utf8_buf(napi_env env, napi_value val, char *buf, size_t cap) {
	if (!buf || cap == 0)
		return false;
	size_t len = 0;
	if (napi_get_value_string_utf8(env, val, buf, cap, &len) != napi_ok)
		return false;
	buf[cap - 1] = '\0';
	return true;
}

/* hasNativeModule() -> boolean (anchors DT_NEEDED for libaxil-hyle) */
static napi_value AxilHyleHasNativeModule(napi_env env, napi_callback_info info) {
	(void)info;
	int rc = axil_hyle_register_partition_routes(NULL);
	napi_value res;
	napi_get_boolean(env, rc == -1, &res);
	return res;
}

/* installRoutes() -> boolean */
static napi_value AxilHyleInstallRoutes(napi_env env, napi_callback_info info) {
	(void)info;
	axil_hyle_install_routes();
	napi_value res;
	napi_get_boolean(env, true, &res);
	return res;
}

/* registerPartitionRoutes(spec) -> boolean */
static napi_value AxilHyleRegisterPartitionRoutes(napi_env env, napi_callback_info info) {
	size_t argc = 1;
	napi_value args[1];
	napi_get_cb_info(env, info, &argc, args, NULL, NULL);
	if (argc < 1) {
		napi_value res;
		napi_get_boolean(env, false, &res);
		return res;
	}

	char mod_buf[64] = {0};
	char part_buf[128] = {0};
	char prim_buf[64] = {0};
	char child_buf[64] = {0};
	char children_buf[64] = {0};
	char pin_buf[64] = {0};
	char upd_buf[64] = {0};
	static char s_redir_bufs[32][256];
	static char s_pin_bufs[32][64];
	static size_t s_slot = 0;

	napi_value v;
	bool has = false;

	if (napi_has_named_property(env, args[0], "module", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "module", &v);
		extract_utf8_buf(env, v, mod_buf, sizeof(mod_buf));
	}
	if (napi_has_named_property(env, args[0], "partitionSource", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "partitionSource", &v);
		extract_utf8_buf(env, v, part_buf, sizeof(part_buf));
	}
	if (!mod_buf[0] || !part_buf[0]) {
		napi_value res;
		napi_get_boolean(env, false, &res);
		return res;
	}

	if (napi_has_named_property(env, args[0], "primaryField", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "primaryField", &v);
		extract_utf8_buf(env, v, prim_buf, sizeof(prim_buf));
	}
	if (napi_has_named_property(env, args[0], "childResource", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "childResource", &v);
		extract_utf8_buf(env, v, child_buf, sizeof(child_buf));
	}
	if (napi_has_named_property(env, args[0], "childrenResource", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "childrenResource", &v);
		extract_utf8_buf(env, v, children_buf, sizeof(children_buf));
	}
	if (napi_has_named_property(env, args[0], "pinField", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "pinField", &v);
		extract_utf8_buf(env, v, pin_buf, sizeof(pin_buf));
	}
	if (napi_has_named_property(env, args[0], "updateAction", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "updateAction", &v);
		extract_utf8_buf(env, v, upd_buf, sizeof(upd_buf));
	}

	bool positional = false;
	if (napi_has_named_property(env, args[0], "positional", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "positional", &v);
		napi_get_value_bool(env, v, &positional);
	}

	size_t idx = s_slot & 31;
	s_slot++;
	s_redir_bufs[idx][0] = '\0';
	if (napi_has_named_property(env, args[0], "redirectPattern", &has) == napi_ok && has) {
		napi_get_named_property(env, args[0], "redirectPattern", &v);
		extract_utf8_buf(env, v, s_redir_bufs[idx], sizeof(s_redir_bufs[idx]));
	}
	s_pin_bufs[idx][0] = '\0';
	if (pin_buf[0]) {
		strncpy(s_pin_bufs[idx], pin_buf, sizeof(s_pin_bufs[idx]) - 1);
		s_pin_bufs[idx][sizeof(s_pin_bufs[idx]) - 1] = '\0';
	}

	axil_hyle_partition_routes_spec_t spec;
	memset(&spec, 0, sizeof(spec));
	spec.module = strdup(mod_buf);
	spec.partition_source = strdup(part_buf);
	spec.primary_field = prim_buf[0] ? prim_buf : NULL;
	spec.child_resource = child_buf[0] ? child_buf : NULL;
	spec.children_resource = children_buf[0] ? children_buf : NULL;
	spec.pin_field = s_pin_bufs[idx][0] ? s_pin_bufs[idx] : NULL;
	spec.positional = positional ? 1 : 0;
	spec.update_action = upd_buf[0] ? upd_buf : NULL;
	spec.redirect_pattern = s_redir_bufs[idx][0] ? s_redir_bufs[idx] : NULL;

	int rc = axil_hyle_register_partition_routes(&spec);
	napi_value res;
	napi_get_boolean(env, rc == 0, &res);
	return res;
}

static napi_value Init(napi_env env, napi_value exports) {
	napi_property_descriptor props[] = {
		{ "hasNativeModule", NULL, AxilHyleHasNativeModule, NULL, NULL, NULL, napi_default, NULL },
		{ "installRoutes", NULL, AxilHyleInstallRoutes, NULL, NULL, NULL, napi_default, NULL },
		{ "registerPartitionRoutes", NULL, AxilHyleRegisterPartitionRoutes, NULL, NULL, NULL, napi_default, NULL },
	};
	napi_define_properties(env, exports, sizeof(props) / sizeof(props[0]), props);
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
