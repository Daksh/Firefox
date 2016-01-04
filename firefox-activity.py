#!/usr/bin/python
"""Thunk to support the low-level activity API.

Supports the following arguments:

 -b, --bundle-id
     Identifier of the activity bundle
 -a, --activity-id
     Identifier of the activity instance.
 -o, --object-id
     Identifier of the associated datastore object.
 -u, --uri
     URI to load.

As well as supporting the
    http://wiki.laptop.org/go/Low-level_Activity_API"""
import os

# see http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
LANGUAGES=['af', 'ar', 'es_AR', 'mn', 'pt_BR']
"""List of languages we support.   We download these language packs from
firefox upstream."""

def sanitize(lang):
    """Return one of `LANGUAGES` which is closest to the given `lang`."""
    if '.' in lang: lang = lang.split('.', 1)[0] # strip off encoding if present
    if lang in LANGUAGES:
        return lang
    else:
        # try the base language.
        if '_' in lang:
            lang = lang.split('_', 1)[0]
            if lang in LANGUAGES:
                return lang
        # now try an inflected lang.
        valid = list(l for l in LANGUAGES if l.startswith(lang+'_'))
        if valid: return valid[0] # arbitrarily chose 'first'
    # nothing appropriate found; fall back to english
    return "C"

def main():
    from optparse import OptionParser
    parser = OptionParser()
    parser.add_option('-b', '--bundle-id', dest='bundle_id', default=None,
                      help='Identifier of the activity bundle')
    parser.add_option('-a', '--activity-id', dest='activity_id', default=None,
                      help='Identifier of the activity instance')
    parser.add_option('-o', '--object-id', dest='object_id', default=None,
                      help='Identifier of the associated datastore object')
    parser.add_option('-u', '--uri', dest='uri', default=None,
                      help='URI to load')
    parser.add_option('--languages', action='store_true',
                      help='Print out the set of languages supported, and quit')
    (options, args) = parser.parse_args()
    if options.languages:
        # firefox substitutes - for _
        print ' '.join(l.replace('_','-') for l in LANGUAGES)
        return

    # XXX in the future we should do something with the -b/a/o args.

    # if 'constant-uid' is enabled (stable build 758 and later),
    # move $HOME down one level, to where we have persistent storage
    if os.getuid() == os.getgid():
        os.environ['HOME'] = os.environ['SUGAR_ACTIVITY_ROOT'] + '/data'
    # sanitize LANG; firefox crashes if it sees a LANG it doesn't know.
    os.environ['LANG'] = sanitize(os.environ['LANG'])+'.utf-8'

    ff = [ './firefox' ]
    if options.uri is not None:
        ff += [ options.uri ]

    os.execl(ff[0], *ff)
    os.abort() # should never reach here.

if __name__ == '__main__': main ()
