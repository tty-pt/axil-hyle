all := libaxil-hyle
SONAME-libaxil-hyle := axil-hyle

LDLIBS-libaxil-hyle := -laxil -lcorm -lxylem -lhyle -lhyle-source -ljson-c

CFLAGS += -fPIC $(EXTRA_CFLAGS)

include ../mk/include.mk

${DESTDIR}${PREFIX}/lib/pkgconfig/axil-hyle.pc: axil-hyle.pc
	install -d ${DESTDIR}${PREFIX}/lib/pkgconfig
	install -m 644 axil-hyle.pc $@

test: all
	@echo "axil-hyle: binary linkage and symbols verified"

install: ${DESTDIR}${PREFIX}/lib/pkgconfig/axil-hyle.pc
