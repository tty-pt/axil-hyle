all := libaxil-hyle
SONAME-libaxil-hyle := axil-hyle

LDLIBS-libaxil-hyle := -laxil -lqmap -lxylem -lhyle -lhyle-source -ljson-c -laxil-auth

CFLAGS += -fPIC $(EXTRA_CFLAGS)

include ../mk/include.mk

${DESTDIR}${PREFIX}/lib/pkgconfig/axil-hyle.pc: axil-hyle.pc
	install -d ${DESTDIR}${PREFIX}/lib/pkgconfig
	install -m 644 axil-hyle.pc $@

install: ${DESTDIR}${PREFIX}/lib/pkgconfig/axil-hyle.pc
